const URL = "https://buscacepinter.correios.com.br/app/endereco/index.php";
const puppeeter = require("puppeteer");
const express = require("express");
const server = express();

async function webScrap(cep) {
    const browser = await puppeeter.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL);

    await page.$eval(
        "#endereco",
        (element, cep) => {
            element.setAttribute("value", cep);
        },
        cep
    );
    await page.click("#btn_pesquisar");
    await page.waitForFunction(
        "document.querySelector('body').innerText.includes('13')"
    );
    const address = await page.$$eval("td", (element) => {
        return element.map((td) => td.textContent);
    });
    browser.close();
    return address;
}

server
    .get("/api/address/:cep", (req, res) => {
        webScrap(req.params.cep)
            .then((address) => {
                res.json(JSON.stringify(address));
            })
            .catch((err) => console.log(err));
    })
    .listen(8080);
