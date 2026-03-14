'use strict'


const username = document.getElementById("user-name");
const userBalance = document.getElementById("user-balance");

const topPlayers = document.getElementById("top");
const stocksItem = document.getElementById("stocks-item-list");
const newsItem = document.getElementById("news-item");
const portfolioItem = document.getElementById("portfolio-item-list");


const templateTop = document.getElementById("players-template");
const templateStock = document.getElementById("stocks-template");
const templateNews = document.getElementById("news-template");
const templatePortfolio = document.getElementById("portfolio-template");
const portfolioValue = document.getElementById("portfolio-value");

let isUpdating = false;

getUserInfo();
getAllUser();
getStocks();
getNews();

setInterval(() => {
    if(isUpdating) {
        return;
    }
    isUpdating = true;
    update();
}, 2_000);

/**
 * function for the permanent updating
 **/
async function update() {
    try{
        await getStocks();
        await getUserInfo();
        await getAllUser();
        await getNews();
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
async function getAllUser(){
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
 * funktion for getting stocks
 **/
async function getStocks(){
    try{
        const response = await fetch("/api/stocks");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        // altes löschen
        clearItems("stock-item");

        const data = await response.json();

        // anzeigen
        data.forEach(stock => {
            const clone = templateStock.content.cloneNode(true);
            const stockName = clone.querySelector(".stock-name");
            const stockPrice = clone.querySelector(".stock-price");
            const stockAmount = clone.querySelector(".stock-amount");

            stockName.textContent = stock.name;
            stockPrice.textContent = stock.price;
            stockAmount.textContent = stock.numberAvailable;

            stocksItem.appendChild(clone);
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

        clearItems("portfolio-item");

        const data = await response.json();



        data.forEach(input => {
            const clone = templatePortfolio.content.cloneNode(true);
            const stockName = clone.querySelector(".stock-name");
            const stockCount = clone.querySelector(".stock-count");
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