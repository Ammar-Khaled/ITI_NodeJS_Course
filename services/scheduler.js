const cron = require('node-cron');
const Post = require('../models/post.model');


class Scheduler {
    constructor() {
        this.tasks = [];
    }

    init() {
        this.publishingScheduledPosts();
        console.log('✅✅ Scheduler initialized successfully');
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

            console.log(`Published ${result.modifiedCount} post(s) successfully`);
            postsToPublish.forEach(post => {
                console.log(`   - Published: "${post.title}" (ID: ${post._id})`);
            });

        } catch (error) {
            console.error('❌❌ Error publishing scheduled posts:', error.message);
        }
    }

    stop() {
        this.tasks.forEach(task => task.stop());
        console.log('Scheduler stopped');
    }
}

const scheduler = new Scheduler();
module.exports = scheduler;
