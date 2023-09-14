import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './bootstrap.min.css';
import './style.css';

// console.log("get node env???", process.env.NODE_ENV)
let REACT_APP_DEV_URL = "";

if (process.env.NODE_ENV !== "production") { // production is 本番環境
	// dotenv.config();
	REACT_APP_DEV_URL = "http://localhost:8080";
	console.log("development");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

export { REACT_APP_DEV_URL };
