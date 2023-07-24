/* eslint-disable unicorn/prevent-abbreviations */
/*
 * Experimental method to "move" an SPA webapp from a localhost server to the environment host.
 *
 * Makes it possible to preview webapp changes in a prod environment without having to deploy code through CI.
 */

import { Express } from "express";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let postedHtml: Record<string, any> = {};

const UIDEV_SESSION = "nom-uidev-session";

export function setupUiDevEndpoint(app: Express) {
  app.get("/uidev", (request, res) => {
    const { ses: uidevSession } = request.query;
    if (uidevSession) {
      res.cookie(UIDEV_SESSION, uidevSession, { sameSite: "strict" });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!postedHtml[uidevSession]) {
        res
          .status(404)
          .send(
            "Error: '" +
              uidevSession +
              '\' was not a valid uidev session. Return to /uidev <a href="/uidev">here</a>',
          );
        return;
      }
      res.redirect("/");
      res.end();
      return;
    }
    const uidevSesValue = extractCookieValue(
      UIDEV_SESSION,
      request.headers.cookie,
    );
    res.send(pageHtml(uidevSesValue));
  });

  app.post("/uidev", async (request, res) => {
    const requestBody = await request.read();
    if (Object.keys(postedHtml).length > 4) {
      res.status(403).send("Too many uidev sessions. Cannot add more");
      return;
    }
    const ses = request.query["ses"] || "default";
    const port = request.query["port"] || "5173";
    let spaHtml = requestBody.toLocaleString();
    spaHtml = spaHtml.replaceAll(
      `import RefreshRuntime from "/@react-refresh"`,
      `import RefreshRuntime from "` +
        "http://localhost:" +
        port +
        `/@react-refresh"`,
    );
    spaHtml = spaHtml.replaceAll(
      "</head>",
      `<style>
        #nom-uidev-warning-banner {
            background-color: red; color: white; 
            margin: 0; padding: 2px;
            border: solid black 2px; 
            position: absolute;
            left: 50%;
            z-index: 9999;
        }
        </style></head>`,
    );
    spaHtml = spaHtml.replaceAll(
      'href="/',
      'href="http://localhost:' + port + "/",
    );
    spaHtml = spaHtml.replaceAll(
      'src="/',
      'src="http://localhost:' + port + "/",
    );
    spaHtml = spaHtml.replace(
      "<body>",
      `<body><a tabindex="-1" id="nom-uidev-warning-banner" href="/uidev">UIDEV MODE</a>`,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    postedHtml[ses] = { html: spaHtml, port };
    res.redirect("/uidev?ses=" + ses);
  });

  app.delete("/uidev", (request, res) => {
    const { ses: uidevSession } = request.query;
    const justDeleteCookie = uidevSession === "";
    if (uidevSession || justDeleteCookie) {
      res.clearCookie(UIDEV_SESSION);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete postedHtml[uidevSession];
      res.end();
    } else {
      const l = Object.keys(postedHtml).length;
      postedHtml = {};
      res.clearCookie(UIDEV_SESSION);
      res.status(200).send("deleted " + l + " html entries.");
    }
  });

  // catch all route for uidev mode
  app.get("*", (request, res, next) => {
    const uidevSessionValue = extractCookieValue(
      UIDEV_SESSION,
      request.headers.cookie,
    );
    if (!uidevSessionValue) {
      next();
      return;
    }
    const sessionIsFound = !!postedHtml[uidevSessionValue];
    if (!sessionIsFound) {
      res.status(404).send(`
                <h1>Error: uidev session is empty</h1>
                <div>Found uidev cookie, but its value is not associated with any uploaded html</div>
                <div>uidev session id: '${uidevSessionValue}'</div> 
                <hr/>
                <div>Return to /uidev <a href="/uidev">here</a> to disable uidev mode</div>
                `);
      return;
    }
    const ses = postedHtml[uidevSessionValue];
    // after performing a vite build:
    // check dist/assets folder for which file-endings that must be included here
    const staticFileEndings = [".svg", ".png", ".css"];
    const staticRequested = staticFileEndings.some((it) =>
      request.path.includes(it),
    );
    if (staticRequested) {
      res.redirect("http://localhost:" + ses.port + request.path);
      return;
    }
    res.send(ses.html);
    res.end();
  });
}

function pageHtml(currentSession?: string) {
  const sessionNames = Object.keys(postedHtml);
  const sessionLines = sessionNames
    .map((sesName) => {
      const link = `<a href="/uidev?ses=${sesName}">${sesName}</a>`;
      const portInfo = `<span>(localhost:${postedHtml[sesName].port})</span>`;
      const button = `<button onclick="clearSes_${sesName}()">clear</button>`;
      const selected =
        sesName === currentSession
          ? "<span> [current]</span>"
          : "<span></span>";
      return link + portInfo + button + selected;
    })
    .join("");
  const sessionDeleteFunctions =
    "\n" +
    sessionNames
      .map(
        (sesName) =>
          `function clearSes_${sesName}(){clearSessionAndCookie("${sesName}")}`,
      )
      .join("\n") +
    "\n";
  const clearSessionPromt = `<span><strong>To exit uidev mode</strong> (to stop fetching the webapp from localhost), </span>
        <button onclick="clearCookie()">clear uidev cookie</button>`;
  const currentSessionInformation = currentSession
    ? `<div>uidev is ENABLED, with uidev session id=${currentSession}</div>`
    : "<div>uidev is currently not active</div>";
  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <script>
                    function postFromDevServerToEnvServer() {
                        const portnum = document.getElementById("input-portnumber").value
                        const sesName = document.getElementById("input-sesid").value
                        showUploadMsg("fetching from devserver...")
                        fetch("http://localhost:" + portnum).then(res => {
                            res.text().then(txt => {
                                showUploadMsg("uploading to host...")
                                fetch("/uidev?ses=" + sesName + "&port=" + portnum, {
                                    method: "POST",
                                    body: txt,
                                })
                                .then(async (it) => {
                                    if(it.status !== 200) {
                                        throw "Error: Status=" + it.status + ", " + await it.text();
                                    } else {
                                        location.reload()
                                    }
                                })
                                .catch((err) => {
                                    showUploadMsg(err)
                                    console.error("Error! uploading index.html to host!")
                                })
                            })
                        }).catch((err) => {
                            showUploadMsg(err)
                            console.error("Error! fetching from devserver!")
                        })
                    }
                    function clearSessions() {
                        fetch("/uidev", {method: "DELETE"}).then(() => location.reload());
                    }
                    function clearSessionAndCookie(sesName) {
                        fetch("/uidev?ses=" + sesName, {method: "DELETE"}).then(() => location.reload());
                    }
                    function clearCookie(){
                        clearSessionAndCookie("")
                    }
                    ${sessionDeleteFunctions}
                    function showUploadMsg(msg){
                        document.getElementById("div-upload-msg").innerHTML = msg
                    }
                    function init() {
                        document.getElementById("div-linkdump").innerHTML = '${sessionLines}'
                    }
                </script>
                <style>
                    #div-content {
                        margin-left: 1.5rem;
                    }
                    #div-content input {
                        margin: 0.1rem 0 0 0;
                    }
                     #div-content * {
                        margin: 0.5rem 0.1rem 0 0;
                    }
  
                    #div-linkdump {
                            display: grid;
                            grid-template-columns: minmax(2rem, max-content) max-content min-content min-content;
                            column-gap: 0.5rem;
                            margin: 0;
                            row-gap: 0.5rem;
                            padding: 1rem 3rem;
                    }
                    #div-linkdump * {
                        margin: 0;
                    }
   
                </style>
                <title>NOM uidev</title>
            </head>
            <body onLoad="init()">
            <div id="div-content">
                <h2><a href="/"/>Home</a></h2>
                <hr/>
                <div><strong>uidev</strong> mode lets you load a webapp served by a localhost dev server from this HOST.</div>
                <ol>
                    <li>Run your dev server</li>
                    <li>Upload index.html from dev server to this host with the upload button</li>
                    <li>Click the uidev session button to set a cookie that will enable uidev mode</li>
                </ol>
                <div><strong>Notes...</strong></div>
                <ul>
                <li>Only tested with vite.js</li>
                <li><span>CHROME USERS!</span>
                <small>Some functionality may be missing because redirects to <code>http://localhost/...</code> 
                are changed into <code>https://localhost/...</code> by the chrome browser. 
                To bypass this, click the padlock icon next to the nom URL, open site specific settings, 
                then change the "unsafe content" setting from "blocked" to "allowed"
                </small></li>
                </ul>
                <hr/>
                <div>Dev server portnumber on localhost:<br/><input id="input-portnumber" value="5173"/></div>
                <div>Session id:<br/><input id="input-sesid" value="default"/></div>
                <button onclick="postFromDevServerToEnvServer()">Upload</button>
                <span id="div-upload-msg"></span>
                <hr/>
                <div>Pick a session here if any are uploaded</div>             
                <ul id="div-linkdump"><li>...</li></ul>
                <br/>
                <hr/>
                ${currentSessionInformation}
                ${currentSession ? clearSessionPromt : ""}
                <hr/>
                <button onclick="clearSessions()">Clear all sessions</button>
            </div>

            </body>
            </html>`;
}

function extractCookieValue(cookieName: string, cookieString?: string) {
  if (!cookieString) throw "Cookie not present";
  const cstr = cookieString + ";";
  const cookieStart = cstr.indexOf(cookieName + "=");
  if (cookieStart === -1) return;
  const cookieEnd =
    cstr.slice(Math.max(0, cookieStart)).indexOf(";") + cookieStart;
  return cstr.slice(cookieStart, cookieEnd).split("=")[1] ?? undefined;
}

export default setupUiDevEndpoint;
