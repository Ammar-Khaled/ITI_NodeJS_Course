const followService = require('../services/follow.service');


exports.followUser = async (req, res) => {
    const { userId: followingId } = req.params;
    const { userId: followerId } = req.user;

    const follow = await followService.followUser(followerId, followingId);

    res.status(201).json({
        message: 'User followed successfully',
        data: follow
    });
};

exports.unfollowUser = async (req, res) => {
    const { userId: followingId } = req.params;
    const { userId: followerId } = req.user;

    await followService.unfollowUser(followerId, followingId);

    res.status(200).json({
        message: 'User unfollowed successfully'
    });
};

exports.getFollowers = async (req, res) => {
    const { userId } = req.params;

    const result = await followService.getFollowers(userId, req.query);

    res.status(200).json({
        message: 'Followers fetched successfully',
        data: result.followers,
        pagination: result.pagination
    });
};

exports.getFollowing = async (req, res) => {
    const { userId } = req.params;

    const result = await followService.getFollowing(userId, req.query);

    res.status(200).json({
        message: 'Following list fetched successfully',
        data: result.following,
        pagination: result.pagination
    });
};

exports.checkFollowing = async (req, res) => {
    const { userId: followingId } = req.params;
    const { userId: followerId } = req.user;
    console.log("Check")
    console.log(req.user)
    const isFollowing = await followService.isFollowing(followerId, followingId);

    res.status(200).json({
        message: 'Follow status fetched successfully',
        data: { isFollowing }
    });
};

exports.getFollowCounts = async (req, res) => {
    const { userId } = req.params;

    const [followersCount, followingCount] = await Promise.all([
        followService.getFollowerCount(userId),
        followService.getFollowingCount(userId)
    ]);

    res.status(200).json({
        message: 'Follow counts fetched successfully',
        data: {
            followersCount,
            followingCount
        }
    });
};
