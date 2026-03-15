'use strict'


const username = document.getElementById("user-name");
const userBalance = document.getElementById("user-balance");

const topPlayers = document.getElementById("top");
const stocksItem = document.getElementById("stocks-item-list");
const newsItem = document.getElementById("news-item");
const portfolioItem = document.getElementById("portfolio-item-list");
const portfolioValue = document.getElementById("portfolio-value");
const messagesItem = document.getElementById("messages");

const templateTop = document.getElementById("players-template");
const templateStock = document.getElementById("stocks-template");
const templateNews = document.getElementById("news-template");
const templatePortfolio = document.getElementById("portfolio-template");
const templateMessage = document.getElementById("message-template");

const tradeList = document.getElementById("trade-menu");

const tradeInput = document.getElementById("sell-input");
const messageInput = document.getElementById("message-text");

const sellBtn = document.getElementById("sell-button");
const buyBtn = document.getElementById("buy-button");
const sendBtn = document.getElementById("send-button");

sellBtn.addEventListener("click", () => tradeStock("sell"));
buyBtn.addEventListener("click", () => tradeStock("buy"));
sendBtn.addEventListener("click", () => formMessage());

let isUpdating = false;

init();

setInterval(() => {
    if(isUpdating) {
        return;
    }
    isUpdating = true;
    update();
}, 2_000);

function init() {
    getUserInfo();
    getAllUsers();
    getStocks();
    getNews();
    getPortfolio();
    getMessage();
    tradeInput.value = "";
}

/**
 * function for the permanent updating
 **/
async function update() {
    try{
        await updateStocks();
        await getUserInfo();
        await getAllUsers();
        await getNews();
        await getPortfolio();
        isUpdating = false;
    } catch(error){
        console.log(error);
    } finally {
        isUpdating = false;
    }
}

/**
* Anzeige des Budgets und Namens des eingelogten Spielers
* */
async function getUserInfo(){
    try {
        const response = await fetch("/api/user");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();
        username.textContent = data.name;
        userBalance.textContent = data.balance;
    } catch (error) {
        console.log(error);
    }
}


/**
 * Methode für die Anzeige alle Spieler nach der Größe ihres Geldzustands
 **/
async function getAllUsers(){
    try{
        const response = await fetch("/api/user/everybody");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();

        // altes löschen
        clearItems("player-item");

        // sortieren absteigend
        data.sort((a, b) => {
            return b.sum - a.sum;
        });

        // anzeigen
        for(let i = 0; i < data.length; i++){
            const clone = templateTop.content.cloneNode(true);
            const rankColumn = clone.querySelector(".rank-column");
            const playerColumn = clone.querySelector(".player-column");
            const valueColumn = clone.querySelector(".value-column");

            rankColumn.textContent = i + 1;
            playerColumn.textContent = data[i].name;
            valueColumn.textContent = data[i].sum;

            topPlayers.appendChild(clone);
        }

    } catch (error){
        console.log(error);
    }
}


/**
 * function for getting stocks which is used only on the beginning, in the init() function
 **/
async function getStocks(){
    try{
        const response = await fetch("/api/stocks");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        // altes löschen
        clearItems("stock-item");

        const selected = tradeList.value;
        tradeList.length = 1;

        const data = await response.json();

        // anzeigen
        data.forEach(stock => {
            const clone = templateStock.content.cloneNode(true);

            const stockItem = clone.querySelector(".stock-item");
            stockItem.dataset.name = stock.name;

            const stockName = clone.querySelector(".stock-name");
            const stockPrice = clone.querySelector(".stock-price");
            const stockAmount = clone.querySelector(".stock-amount");

            stockName.textContent = stock.name;
            stockPrice.textContent = stock.price;
            stockAmount.textContent = stock.numberAvailable;

            stocksItem.appendChild(clone);

            // add all available stocks to the list
            const option = document.createElement("option");
            option.value = stock.name;
            option.textContent = stock.name;

            tradeList.appendChild(option);
        });

        tradeList.value = selected;
    } catch (error){
        console.log(error);
    }
}

/**
 * function for permanent updating, only price and amount
 * */
async function updateStocks(){
    try{
        const response = await fetch("/api/stocks");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();

        data.forEach(stock => {
            const el = document.querySelector(`.stock-item[data-name="${stock.name}"]`);
            const price = el.querySelector(".stock-price");
            const count = el.querySelector(".stock-amount");

            price.textContent = stock.price;
            count.textContent = stock.numberAvailable;
        });
    } catch (error){
        console.log(error);
    }
}

/**
 * funk for the news
 **/
async function getNews(){
    try{
        const response = await fetch("/api/news");
        if(!response.ok){
            throw new Error(response.statusText);
        }

        // remove old
        clearItems("news");

        const data = await response.json();

        // anzeigen
        data.forEach(news => {
            const clone = templateNews.content.cloneNode(true);
            const newsText = clone.querySelector(".news-text");
            const newsTime = clone.querySelector(".news-time");

            newsText.textContent = news.text;
            newsTime.textContent = news.time;

            newsItem.appendChild(clone);
        });

    } catch (error){
        console.log(error);
    }
}

/**
 * get Portfolio
 * */
async function getPortfolio(){
    try{
        const response = await fetch("/api/account");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        // clear old values
        clearItems("portfolio-item");

        const data = await response.json();

        portfolioValue.textContent = `The total price of your portfolio: ${data.value}$`;

        data.positions.forEach(position => {

            if(position.number !== 0){
                const clone = templatePortfolio.content.cloneNode(true);
                const stockName = clone.querySelector(".stock-name");
                const stockCount = clone.querySelector(".stock-count");

                stockName.textContent = position.stock.name;
                stockCount.textContent = position.number;

                portfolioItem.appendChild(clone);
            }
        });
    } catch (error){
        console.log(error);
    }
}

/**
 * help func for clearing
 * @param name the name of obj from the DOM
 * */
function clearItems(name){
    let items = Array.from(document.getElementsByClassName(name));
    items.forEach(item => {
        item.remove();
    });
}


/**
 * methode für Stock ver-/einkaufen
 * @param action sell or buy
 * */
async function tradeStock(action){
    const stockName = tradeList.value;
    let value = Number(tradeInput.value);

    if(stockName === "---" || !Number.isInteger(value) || value <= 0){
        return;
    }

    if(action === "sell"){
        value = - value;
    }

    const transaction = {
        stock: {
            name: stockName,
        },
        number: value
    };

    try{
        const response = await fetch("/api/account/positions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction)
        });

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();
        console.log("Success:", data);
        tradeInput.value = "";
        await update();
    } catch (error){
        console.log(error);
    }
}

async function getMessage(){
    try{
        const response = await fetch("/api/messages");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();

        // drop old values
        clearItems("sms");

        // avoiding of doubled messages
        const seen = new Set();

        // creating uniq key and at the same time add obj. to DOM
        data.forEach(message => {
            const recipient = message.recipient;

            if(recipient === username.textContent) {
                const key = `${message.sender}|${message.recipient}|${message.text}|${message.date}`;
                if(seen.has(key)){
                    return;
                }
                seen.add(key);
                showMessage(message);
            }
        });
    } catch (error){
        console.log(error);
    }
}

/**
 * helping function for the showing single message
 * @param message - input message
 * */
function showMessage(message){
            const sender = message.sender;
            const date = new Date(message.date);
            const text = message.text;

            const clone = templateMessage.content.cloneNode(true);
            const smsSender = clone.querySelector(".sms-sender");
            const smsText = clone.querySelector(".sms-text");
            const smsDate = clone.querySelector(".sms-date");

            smsSender.textContent = `New message from: ${sender}: `;
            smsText.textContent = text;
            smsDate.textContent = date;

            messagesItem.appendChild(clone);
}

/**
 * function for getting all receivers and text from DOM and convert it to POST obj.
 * */
async function formMessage(){
    try{
        const checkboxes = document.querySelectorAll(".recipient:checked");
        const recipient = Array.from(checkboxes).map((el) => el.value);

        const text = messageInput.value;

        if(text === null || text.trim() === "" || recipient.length === 0){
            return;
        }

        for(const player of recipient){
            await sendMessage(player, text);
        }

        checkboxes.forEach(checkbox => checkbox.checked = false);

        messageInput.value = "";

        await getMessage();

        console.log("success");
    } catch (error){
        console.log(error);
    }
}

/**
 * function to send request to the server for messages
 * @param player - receiver
 * @param text - message text
 * */
async function sendMessage(player, text){
    const message = {
        recipient: player,
        message: text,
    }

    const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message)
    });

    if(!response.ok){
        throw new Error(response.statusText);
    }
}