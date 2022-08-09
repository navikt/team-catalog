
const setupLogoutRoutes = (app) => {
    app.use('^/logout$',
        (req, res) => {
            req.logout(function(err) {
                if (err) {
                    return next(err);
                }
            });
            res.redirect('/');
        }
    );
}

export default { setupLogoutRoutes };