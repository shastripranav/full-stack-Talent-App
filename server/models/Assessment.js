const mongoose = require('mongoose');
const technologyCompetencies = require('../utils/competencies');

const AssessmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    technology: {
        type: String,
        required: true,
        enum: Object.keys(technologyCompetencies)
    },
    level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Mid-Level', 'Senior-Executive']
    },
    questions: [{
        id: String,
        text: String,
        options: [String],
        correctAnswer: Number,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        bloomsCategory: {
            type: String,
            enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Create', 'Evaluate']
        },
        competency: {
            type: String,
            required: true
        }
    }],
    userAnswers: {
        type: [Number],
        validate: {
            validator: function(v) {
                return v.every(num => num === null || (Number.isInteger(num) && num >= 0 && num <= 3));
            },
            message: props => `${props.value} contains invalid answers. Each answer must be null or an integer between 0 and 3.`
        }
    },
    score: Number,
    result: {
        barChartData: [{
            category: String,
            correct: Number,
            total: Number
        }],
        spiderChartData: [{
            competency: String,
            score: Number
        }],
        selected: Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    submitted: {
        type: Boolean,
        default: false
    }
});

function arrayLimit(val) {
    return val.length === 6;
}

AssessmentSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('technology')) {
        this.competencies = technologyCompetencies[this.technology] || [];
    }
    next();
});

module.exports = mongoose.model('Assessment', AssessmentSchema);

 
