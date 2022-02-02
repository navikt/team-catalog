// Info GET endpoints
function setupAcuators(app) {
    app.get('/internal/health/liveness', (req, res, next) => {
        res.send({
            "status":"UP"
        });
    });
    console.log('Liveness available on /internal/health/liveness')

    app.get('/internal/health/readiness', (req, res, next) => {
        res.send({
            "status":"UP"
        });
    });
    console.log('Readiness available on /internal/health/readiness')
}

export default setupAcuators
