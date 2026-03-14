'use strict'


const username = document.getElementById("user-name");
const userBalance = document.getElementById("user-balance");

const topPlayers = document.getElementById("top-players");
const stocksItem = document.getElementById("stocks-item-list");

const templateTop = document.getElementById("players-template");
const templateStock = document.getElementById("stocks-template");


getUserInfo();
getAllUser();
getStocks();

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

        // sortieren absteigend
        data.sort((a, b) => {
            return a.sum - b.sum;
        });

        // altes löschen
        const users = document.getElementsByClassName("")


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
 *
 **/
async function getStocks(){
    try{
        const response = await fetch("/api/stocks");

        if(!response.ok){
            throw new Error(response.statusText);
        }

        const data = await response.json();

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