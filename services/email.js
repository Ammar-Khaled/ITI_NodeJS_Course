const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_GMAIL_ADDRESS,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

function loadTemplate(templateName, variables = {}) {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Add common variables
    variables.currentYear = new Date().getFullYear();
    variables.frontendUrl = FRONTEND_URL;

    // Replace all {{variableName}} with actual values
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value || '');
    }

    return template;
}


async function sendWelcomeEmail(user) {
    try {
        const html = loadTemplate('welcome.html', {
            userName: user.name
        });

        const info = await transporter.sendMail({
            to: user.email,
            subject: "Welcome to Our Blog! 🎉",
            html
        });

        console.log("Welcome email sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error sending welcome email:", err);
        throw err;
    }
}

async function sendPasswordResetEmail(user, resetToken) {
    try {
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = loadTemplate('passwordReset.html', {
            userName: user.name,
            resetUrl,
            expiryTime: '15' // 15 minutes
        });

        const info = await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request 🔐",
            html
        });

        console.log("Password reset email sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error sending password reset email:", err);
        throw err;
    }
}


async function sendPasswordResetConfirmation(user) {
    try {
        const html = loadTemplate('passwordResetConfirmation.html', {
            userName: user.name,
            userEmail: user.email,
            resetDate: new Date().toLocaleString()
        });

        const info = await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Successful ✅",
            html
        });

        console.log("Password reset confirmation sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error sending password reset confirmation:", err);
        throw err;
    }
}


async function sendCommentNotification(postAuthor, commenter, post, comment) {
    try {
        // Don't send notification if user comments on their own post
        if (postAuthor._id.toString() === commenter._id.toString()) {
            return null;
        }

        const html = loadTemplate('commentNotification.html', {
            postAuthorName: postAuthor.name,
            commenterName: commenter.name,
            commenterInitial: commenter.name.charAt(0).toUpperCase(),
            postTitle: post.title,
            postDate: new Date(post.createdAt).toLocaleDateString(),
            commentContent: comment.content,
            commentDate: new Date(comment.createdAt).toLocaleString(),
            postUrl: `${FRONTEND_URL}/posts/${post._id}`,
            replyUrl: `${FRONTEND_URL}/posts/${post._id}#comment-${comment._id}`,
            totalComments: post.commentsCount || '0',
            totalLikes: post.likesCount || '0',
            totalViews: post.views || '0'
        });

        const info = await transporter.sendMail({
            to: postAuthor.email,
            subject: `💬 ${commenter.name} commented on your post`,
            html
        });

        console.log("Comment notification sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error sending comment notification:", err);
        throw err;
    }
}

async function sendReplyNotification(commentAuthor, replier, comment, reply, post) {
    try {
        // Don't send notification if user replies to their own comment
        if (commentAuthor._id.toString() === replier._id.toString()) {
            return null;
        }

        const html = loadTemplate('replyNotification.html', {
            commentAuthorName: commentAuthor.name,
            replierName: replier.name,
            replierInitial: replier.name.charAt(0).toUpperCase(),
            postTitle: post.title,
            postUrl: `${FRONTEND_URL}/posts/${post._id}`,
            originalComment: comment.content.substring(0, 150) + (comment.content.length > 150 ? '...' : ''),
            replyContent: reply.content,
            replyDate: new Date(reply.createdAt).toLocaleString(),
            commentUrl: `${FRONTEND_URL}/posts/${post._id}#comment-${comment._id}`,
            replyBackUrl: `${FRONTEND_URL}/posts/${post._id}#comment-${reply._id}`
        });

        const info = await transporter.sendMail({
            to: commentAuthor.email,
            subject: `↩️ ${replier.name} replied to your comment`,
            html
        });

        console.log("Reply notification sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error sending reply notification:", err);
        throw err;
    }
}

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmation,
    sendCommentNotification,
    sendReplyNotification,
    loadTemplate
};