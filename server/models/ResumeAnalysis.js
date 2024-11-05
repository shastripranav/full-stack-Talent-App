const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    resumeText: {
        type: String,
        required: true
    },
    analysis: {
        summary: {
            candidateName: String,
            professionalSummary: String
        },
        skills: {
            technical: [String],
            nonTechnical: [String],
            certifications: [String]
        },
        workExperience: [{
            company: String,
            position: String,
            duration: String,
            responsibilities: [String],
            achievements: [String]
        }],
        education: [{
            degree: String,
            field: String,
            institution: String,
            year: Number,
            achievements: [String]
        }],
        projects: [{
            name: String,
            description: String,
            technologies: [String],
            highlights: [String]
        }],
        strengths: [String],
        overallCompetencies: {
            technical: [{
                skill: String,
                proficiencyLevel: String // e.g., "Expert", "Intermediate", "Beginner"
            }],
            nonTechnical: [{
                skill: String,
                proficiencyLevel: String
            }]
        },
        top4Skills: [{
            skill: String,
            proficiencyLevel: String
        }],
        matchScore: {
            skillsAlignment: Number,
            projectAlignment: Number,
            overallScore: Number
        },
        futureRoleSuggestions: [{
            role: String,
            reason: String,
            requiredSkills: [String],
            skillGaps: [String]
        }]
    },
    analyzedDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema); 