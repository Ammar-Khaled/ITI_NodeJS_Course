const cron = require('node-cron');
const Post = require('../models/post.model');
const logger = require('../utils/logger');


class Scheduler {
    constructor() {
        this.tasks = [];
    }

    init() {
        this.publishingScheduledPosts();
        logger.info('Scheduler initialized successfully');
    }

    publishingScheduledPosts() {
        const task = cron.schedule('* * * * *', async () => {
            await this.publishScheduledPosts();
        });

        this.tasks.push(task);
    }

    async publishScheduledPosts() {
        try {
            const now = new Date();

            const postsToPublish = await Post.find({
                status: 'scheduled',
                publishedAt: { $lte: now }
            });

            if (postsToPublish.length === 0) {
                return;
            }

            const result = await Post.updateMany(
                {
                    status: 'scheduled',
                    publishedAt: { $lte: now }
                },
                {
                    $set: { status: 'published' }
                }
            );

            logger.info(`Published ${result.modifiedCount} post(s) successfully`);
            postsToPublish.forEach(post => {
                logger.info(`   - Published: "${post.title}" (ID: ${post._id})`);
            });

        } catch (error) {
            logger.error('Error publishing scheduled posts:', error);
        }
    }

    stop() {
        this.tasks.forEach(task => task.stop());
        logger.info('Scheduler stopped');
    }
}

const scheduler = new Scheduler();
module.exports = scheduler;
