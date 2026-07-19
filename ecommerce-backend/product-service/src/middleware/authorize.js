module.exports = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized"

            });

        }

        const groups = req.user.groups || [];

        const authorized = roles.some(role =>
            groups.includes(role)
        );

        if (!authorized) {

            return res.status(403).json({

                success: false,

                message: "Access Denied."

            });

        }

        next();

    };

};