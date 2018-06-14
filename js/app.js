const app = angular.module('mainApp', []);

app.controller('mainController', ($scope) => {

    // DATA MODEL
    class Player {
        constructor() {
            this.clean();
        }

        score() {
            let score = this.scoreList.reduce((s, e) => s + e, 0);
            let numberOfAces = this.cards.reduce((count, e) => count += e.includes('A') ? 1 : 0 , 0);
            
            while(score > 21 && numberOfAces) {
                score -= 10;
                numberOfAces--;
            }

            return score;
        }

        newCard() {
            const highFace = { '11': 'A', '12': 'J', '13': 'Q', '14': 'K' };
            const symbol = { '0': 'H', '1': 'D', '2': 'C', '3': 'S' };
            let randomFace, randomSymbol, newCard;

            const assignCard = () => {
                randomFace = Math.floor(Math.random() * 13 + 2);
                randomSymbol = Math.floor(Math.random() * 4);
                return {
                    card: `${randomFace > 10 ? highFace[randomFace] : randomFace}${symbol[randomSymbol]}`,
                    points: randomFace > 11 ? 10 : (randomFace === 11 ? 11 : randomFace)
                }
            };

            newCard = assignCard();

            while (this.cards.includes(newCard.card)) {
                newCard = assignCard();
            }

            this.cards.push(newCard.card);
            this.scoreList.push(newCard.points);
        }

        clean() {
            this.cards = [];
            this.scoreList = [];
        }
    }

    // GAME ACTIONS
    const checkGame = () => {
        const playerScore = $scope.game.player.score(), dealerScore = $scope.game.dealer.score();
        // player busts
        if (playerScore > 21) return 'dealer';

        // dealer's turn
        if ($scope.game.dealer.cards.length > 1) {
            if (dealerScore === playerScore) {
                return 'tie';
            }
            if (playerScore > dealerScore || dealerScore > 21) {
                return 'player';
            }

            return 'dealer';
        }

        // no winner yet
        return false;
    }
    
    const checkGameStatus = (check) => {
        if (check) {
            disableButtons();
            switch (check) {
                case 'player':
                    newMessage('Player won!', 'win');
                    break;
                case 'dealer':
                    newMessage('Player lost :(', 'lose');
                    break;
                case 'tie':
                    newMessage('It\'s a tie', 'tie');
            }
        }
    };

    // GAME STATUS
    $scope.game = {
        dealer: new Player(),
        player: new Player()
    };    

    // LOG SECTION
    $scope.log = [];
    const newMessage = (text, css) => {
        $scope.log.push({ text, css });
    }

    // BUTTON ACTIONS
    $scope.newGame = init;

    const enableButtons = () => {
        $scope.hit = () => {
            $scope.game.player.newCard();
            newMessage('Hit me!', 'action-message');
            newMessage(`Player has ${$scope.game.player.score()}`);
            checkGameStatus(checkGame());
        };

        $scope.stand = () => {
            newMessage('Stand', 'action-message');
            // dealer's turn
            disableButtons();
            newMessage('Dealer\'s turn', 'action-message');
            while ($scope.game.dealer.score() < 17) {
                $scope.game.dealer.newCard();
                newMessage(`Dealer has ${$scope.game.dealer.score()}`);
            }
            checkGameStatus(checkGame());
        };
    }

    const disableButtons = () => {
        $scope.hit = () => '';
        $scope.stand = () => '';
    }

    // INITIALIZE
    function init() {
        // Clean everything and enable buttons
        $scope.game.dealer.clean();
        $scope.game.player.clean();
        $scope.log = [];
        enableButtons();

        // Deal new cards
        $scope.game.dealer.newCard();
        newMessage(`Dealer has ${$scope.game.dealer.score()}`);
        $scope.game.player.newCard();
        $scope.game.player.newCard();
        newMessage(`Player has ${$scope.game.player.score()}`);
    }

    init();

    // TESTING
    window.game = $scope.game;
});