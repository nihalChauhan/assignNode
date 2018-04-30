// Middleware, this will validate authentication token for super auth.
module.exports = function(request, response, next) {
	let authentication = request.headers.authentication;
	if (authentication !== process.env.SUPER_AUTH_TOKEN) {
		// Cannot delete in production system
		return response.sendStatus(401);
	} else {
		return next();
	}
};
