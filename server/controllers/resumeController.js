const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { analyzeResumeWithGPT } = require('../utils/chatgpt');

// Add the extractResumeText function
const extractResumeText = async (filePath) => {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        const fileContent = await fs.readFile(filePath);

        let text = '';

        if (fileExtension === '.pdf') {
            // Handle PDF files
            const pdfData = await pdf(fileContent);
            text = pdfData.text;
        } else if (fileExtension === '.docx') {
            // Handle DOCX files
            const result = await mammoth.extractRawText({ buffer: fileContent });
            text = result.value;
        } else {
            throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
        }

        // Clean up the extracted text
        text = text
            .replace(/\n+/g, ' ') // Replace multiple newlines with space
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();

        return text;
    } catch (error) {
        console.error('Error extracting text from resume:', error);
        throw new Error(`Failed to extract text from resume: ${error.message}`);
    }
};

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create new resume document
        const resume = new Resume({
            userId: req.user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
        });

        // Save resume to database
        await resume.save();
        
        res.status(200).json({ 
            message: 'Resume uploaded successfully',
            resumeId: resume._id,
            file: {
                fileName: req.file.originalname,
                uploadDate: resume.uploadDate
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading resume',
            error: error.message 
        });
    }
};

const analyzeResume = async (req, res) => {
    try {
        const { resumeId } = req.params; // Get resumeId from URL parameters

        // Find the resume
        const resume = await Resume.findOne({ 
            _id: resumeId,
            userId: req.user.id // Ensure the resume belongs to the requesting user
        });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // First check if analysis already exists
        let existingAnalysis = await ResumeAnalysis.findOne({
            resumeId: resumeId,
            userId: req.user.id
        });

        let analysis;
        
        if (existingAnalysis) {
            console.log('Using existing analysis');
            analysis = existingAnalysis.analysis;
        } else {
            console.log('Performing new analysis');
            // Extract text from the resume file
            const resumeText = await extractResumeText(resume.filePath);
            
            // Analyze the resume using GPT
            analysis = await analyzeResumeWithGPT(resumeText);
            console.log(analysis);

            // Create and save analysis
            const resumeAnalysis = new ResumeAnalysis({
                userId: req.user.id,
                resumeId: resume._id,
                resumeText: resumeText,
                analysis: analysis,
                fileName: resume.fileName
            });
            
            await resumeAnalysis.save();

            // Update resume status
            resume.status = 'analyzed';
            await resume.save();
        }

        // Return the analysis response (same structure whether new or existing)
        res.status(200).json({
            message: existingAnalysis ? 'Retrieved existing analysis' : 'Resume analysis completed',
            resumeId: resume._id,
            analysis: {
                summary: {
                    candidateName: analysis.summary.candidateName,
                    professionalSummary: analysis.summary.professionalSummary
                },
                skills: {
                    technical: analysis.skills.technical,
                    nonTechnical: analysis.skills.nonTechnical,
                    certifications: analysis.skills.certifications
                },
                workExperience: analysis.workExperience,
                education: analysis.education,
                projects: analysis.projects,
                strengths: analysis.strengths,
                overallCompetencies: {
                    technical: analysis.overallCompetencies.technical,
                    nonTechnical: analysis.overallCompetencies.nonTechnical
                },
                top4Skills: analysis.top4Skills,
                matchScore: {
                    skillsAlignment: analysis.matchScore.skillsAlignment,
                    projectAlignment: analysis.matchScore.projectAlignment,
                    overallScore: analysis.matchScore.overallScore
                },
                futureRoleSuggestions: analysis.futureRoleSuggestions
            }
        });
    } catch (error) {
        // If resume exists, update its status to failed
        if (req.params.resumeId) {
            try {
                await Resume.findByIdAndUpdate(req.params.resumeId, { status: 'failed' });
            } catch (updateError) {
                console.error('Error updating resume status:', updateError);
            }
        }

        res.status(500).json({ 
            message: 'Error analyzing resume',
            error: error.message 
        });
    }
};

// Add new endpoints to get resume history
const getResumeHistory = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id })
            .sort({ uploadDate: -1 });
        
        res.status(200).json({
            message: 'Resume history retrieved',
            resumes
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving resume history',
            error: error.message
        });
    }
};

// Get specific analysis
const getAnalysis = async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findOne({
            resumeId: req.params.resumeId,
            userId: req.user.id
        });

        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        res.status(200).json({
            message: 'Analysis retrieved successfully',
            analysis
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving analysis',
            error: error.message
        });
    }
};

module.exports = {
    uploadResume,
    analyzeResume,
    getResumeHistory,
    getAnalysis
};
