//@ts-nocheck
$(function () {
    // $("#start").click(() => {
    //     gVar.drawTimes = $('#drawTimes').val();
    //     gVar.handCard = $('#handCard').val();
    //     getDeck();
    // })

});

// function main() {
//     let success = 0;
//     let allTimes = 100000;
//     for (let times = 0; times < allTimes; times++) {
//         let deck = [];

//         deck = createDeck(deck);
//         deck = shuffle(deck);

//         for (let i = 0; i < 5; i++) {
//             let size = deck.length;
//             let eleAry = deck.splice(Math.floor(Math.random() * size), 1);
//             if (eleAry[0] > 0) {
//                 success++;
//                 break;
//             }
//         }
//     }

//     console.log("success", success, "Times", allTimes, "P=", success / allTimes);
// }

function createDeck(deck) {
    for (let i = 0; i < 3; i++)
        deck.push(1);

    for (let i = 0; i < 57; i++)
        deck.push(0);

    return deck;
}


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


var main = new Vue({
    el: '#app',
    data: {
        gVar: {
            deck: [],
            cardlist: {},
            drawTimes: null,
            handCardNum: null,
            handCard: [],
            deckStream: null,
        },
    },
    methods: {
        startAnalysis: function(event) {
        },
        getDeck: function(event) {
            let self = this;
            self.gVar.deck = [];
            self.gVar.cardlist = {};

            if (!self.gVar.deckStream)
                return ;
            let line = self.gVar.deckStream.split(/\n/);

            line.forEach((ele, idx) => {
                let l = ele.trim();
                let char_idx;
                if (l.substring(0, 2) === "//" || l.substring(0, 1) === "#" || l.substring(0, 1) === "!")
                    return;
                if ((char_idx = l.search(/\s\/\//)) !== -1 || (char_idx = l.search(/\s#/)) !== -1) {
                    l = l.substring(0, char_idx);
                    l = l.trim();
                }
                if (!self.gVar.cardlist[l])
                    self.gVar.cardlist[l] = 0;

                self.gVar.cardlist[l] += 1;
                self.gVar.deck.push(l);
            });
            console.log(self.gVar.cardlist, self.gVar.deck);
        },
        getHand: function(event) {
            let self = this;

            if (!self.gVar.handCardNum) {
                alert("請設定手牌張數");
                return;
            }

            if (self.gVar.handCard.length >= self.gVar.handCardNum) {
                alert("已到達設定手牌數量上限");
                return;
            }

            let card = event.target.innerText;

            self.gVar.handCard.push(card);
        },
        delHand: function(event) {
            let self = this;
            self.gVar.handCard.splice(event.target.index, 1);
        },
    }
});
