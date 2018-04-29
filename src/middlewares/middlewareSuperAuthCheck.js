// Middleware, this will validate authentication token for super auth.
module.exports = function(request, response, next) {
	let password = request.headers.password;
	if (process.env.DEBUG !== 'true' || !password || password !== process.env.SUPER_AUTH_PASSWORD) {
		// Cannot delete in production system
		return response.sendStatus(401);
	} else {
		return next();
	}
};
