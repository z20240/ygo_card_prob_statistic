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

function createDeck(deckTemplate) {
    let deck = [];
    for (let i = 0; i < deckTemplate.length; i++)
        deck.push(deckTemplate[i]);
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
            drawTimes: 100000,
            handCardLimit: null,
            handCard: [{
                canBeChanged:true,
                cardAmount:1,
                cards:{},
            }],
            deckStream: null,
            cardSetIdx:1,
        },
        gOutPut : {
            prob_str : "此牌組合的機率為：0",
            handSet : [],
        }
    },
    methods: {
        startAnalysis: function(event) {
            let self = this;
            let successCardSet = [];
            let sucCount = 0;

            self.gOutPut.prob_str = "正在為您計算中，請稍候...";

            if (Object.keys(self.gVar.handCard[self.gVar.handCard.length-1].cards).length <= 0) {
                self.gVar.handCard.splice(self.gVar.handCard.length-1, 1);
            }

            for (let ti = 0 ; ti < self.gVar.drawTimes ; ti++) {
                let tmpDeck = createDeck(self.gVar.deck);
                tmpDeck = shuffle(tmpDeck);
                let tempHandCard = JSON.parse(JSON.stringify(self.gVar.handCard)); // 深層
                let {result, cardSet} = checkSuccessDraw(tmpDeck, tempHandCard, self.gVar.handCardLimit);

                if (result) {
                    console.log("success", sucCount);
                    sucCount++;
                    successCardSet.push(cardSet);
                }
            }

            console.log(sucCount, "pro", (sucCount / self.gVar.drawTimes), successCardSet);
            self.gOutPut.prob_str = "此牌組合的機率為：" + (sucCount / self.gVar.drawTimes);
            self.gOutPut.handSet = successCardSet;
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
            let setAmout = self.gVar.handCard.length-1;

            console.log("setAmout", setAmout, self.gVar.handCard)
            if (!self.gVar.handCardLimit) {
                alert("請設定手牌數量");
                return;
            }

            if (!self.gVar.handCard[setAmout].cardAmount) {
                alert("請設定此組合數量");
                return;
            }

            if (!self.gVar.handCard[setAmout]
                || Object.keys(self.gVar.handCard[setAmout].cards).length+1 >= self.gVar.handCard[setAmout].cardAmount) {
                if (self.gVar.handCard[setAmout]) {
                    self.gVar.handCard[setAmout].canBeChanged = false;
                }
                self.$set(self.gVar.handCard, setAmout+1, {
                    canBeChanged : true,
                    cardAmount : 1,
                    cards : {},
                });
            }

            let card = event.target.innerText;

            self.gVar.handCard[setAmout].cards[card] = 1;
        },
        delHand: function(event, set) {
            let self = this;
            console.log(event, set);
            delete self.gVar.handCard[set].cards[event.target.innerText];
        },
        deleteThis: function(set) {
            let self = this;
            self.gVar.handCard.splice(set, 1);
        },
    }
});

function checkSuccessDraw(deck, HandcardSets, drawTimes) {
    let cardSet = [], successCount = [];
    let result = false;
    for (let i = 0 ; i < drawTimes ; i++) { // 5抽
        let size = deck.length;
        let cardAry = deck.splice(Math.floor(Math.random() * size), 1);

        let card = cardAry[0];
        cardSet.push(card); // 抽出來的牌型

        for (let set = 0 ; set < HandcardSets.length ; set++) {

            if (typeof(HandcardSets[set].cards[card]) !== 'undefined') {
                delete HandcardSets[set].cards[card]; // 將比對中的拿掉
                if (!successCount[set]) successCount[set] = 0;
                successCount[set]++;

                if (successCount[set] == HandcardSets[set].cardAmount)
                    result = true;
            }
        }

    }

    if (result) {
        return {result: true, cardSet: cardSet};
    } else {
        return {result: false, cardSet: []};
    }
}
