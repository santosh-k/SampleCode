const express = require('express');
const config = require('config');

module.exports = class App {
	constructor(appInit) {
		this.app = express();
		this.middleWare(appInit.middleWares);
		this.port = appInit.port;
		this.assets();
		this.routes(appInit.controllers);
		this.errorHandler(appInit.errorHandlers);
		this.initDatabse();
	}

	middleWare(middleWares) {
		middleWares.forEach((middleWare) => {
			this.app.use(middleWare);
		});

	}
	assets() {
		this.app.use(express.static('public'));
	}

	routes(controllers) {
		controllers.forEach((controller) => {
			this.app.use("/api/v1" + controller.path, controller.router);
		});
	}

	errorHandler(errorHandlers) {
		errorHandlers.forEach((errorHandler) => {
			this.app.use(errorHandler)
		})
	}

	initDatabse() {
		require('./db/mongodb');
	}


	listen() {
		this.app.listen(this.port, () => {
			logger.info(`App listening on the ${config.get("url.site_url")}/api/v1`);
			logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
		});
	}
}