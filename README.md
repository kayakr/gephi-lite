# Gephi Lite

Gephi Lite is a free and open-source web application to visualize and explore networks and graphs. It is a web-based, lighter version of [Gephi](https://gephi.org/). You can try it here:

**[gephi.org/gephi-lite](https://gephi.org/gephi-lite)**

It is currently under active developments, so features can evolve quite quickly. Feel free to report bugs or ask for new features in the [issues board](https://github.com/gephi/gephi-lite/issues).

You can read more about the intent of this project on the [Gephi blog](https://gephi.wordpress.com/2022/11/15/gephi-lite/).

## License

Gephi Lite source code is distributed under the [GNU General Public License v3](http://www.gnu.org/licenses/gpl.html).

## Run locally

Gephi Lite is a web application, written using [TypeScript](https://www.typescriptlang.org/) and [React](https://react.dev/). The styles are written using [SASS](https://sass-lang.com/), and are based on [Bootstrap v5](https://getbootstrap.com/).

Gephi Lite uses [sigma.js](https://www.sigmajs.org/) for graph rendering, and [graphology](graphology.github.io/) as the graph model as well as for graph algorithms. It has been bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To build Gephi Lite locally, you first need a recent version of [Node.js](https://nodejs.org/en) with [NPM](https://www.npmjs.com/) installed on your computer. You can then install the dependencies by running `npm install` in Gephi Lite's directory.

Now, in the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000/gephi-lite](http://localhost:3000/gephi-lite) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your Gephi Lite is ready to be deployed!

## Deploy the application

To allow users to synchronize their data with GitHub, Gephi Lite needs a reverse proxy to avoid CORS issues. When working locally in development, [we use `http-proxy-middleware`](https://github.com/gephi/gephi-lite/blob/main/src/setupProxy.js) to make that work.

To deploy the application, you need to define the env variable `REACT_APP_GITHUB_PROXY` before building it, by following those steps:

```
$> REACT_APP_GITHUB_PROXY=mydomain.for.github.auth.proxy.com
$> npm install
$> npm run build
```

On [gephi.org/gephi-lite](https://gephi.org/gephi-lite) we use this settings : `REACT_APP_GITHUB_PROXY: "https://githubapi.gephi.org"`.

Then on our server, we configured NGINX with this following settings:

```nginx
server {
    listen       443 ssl;
    server_name githubapi.gephi.org;

    ssl_certificate /etc/letsencrypt/live/githubapi.gephi.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/githubapi.gephi.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

   location /login {
     add_header Access-Control-Allow-Origin "https://gephi.org";
     add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
     add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, user-agent";
     if ($request_method = OPTIONS) {
        return 204;
     }
     proxy_pass https://github.com/login;
   }

   location / {
     return 404;
   }
}
```

PS: On this configuration you should change the `server_name` with its ssl configuration, as well as the `add_header Access-Control-Allow-Origin` value.
