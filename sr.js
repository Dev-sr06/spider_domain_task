document.addEventListener('DOMContentLoaded', () => {
    
    const rows = 6;
    const columns = 7;
    const winlength = 4;
    const timer = 30;

    const game_board = document.querySelector(".game_board");
    const game_message = document.querySelector(".game_message");

    const start_btn = document.querySelector(".start_btn");
    const reset_btn = document.querySelector('.reset_btn');

    const red_p_status = document.querySelector(".red_p_status");
    const yellow_p_status = document.querySelector(".yellow_p_status");

    const red_p_timer = document.querySelector(".red_P_timer");
    const yellow_p_timer = document.querySelector("#yellow_p_timer");

    const block_column_modal = document.querySelector('.blockColumn');
    const column_close_btn = document.querySelector(".column_close_btn");
    const block_column_title = document.querySelector('#block_column_title');
    const block_column_btn = document.querySelector(".block_column_btn");

    const game_over_modal = document.querySelector(".game_over");
    const game_over_title = document.querySelector(".game_over_title");
    const game_over_message = document.querySelector(".game_over_message");

    const play_again_btn = document.querySelector(".play_again_btn");
    const close_btn = document.querySelector(".close");
    
    const red_p_win_display = document.querySelector('.red_P_win');
    const yellow_p_win_display = document.querySelector('.yellow_p_win');
    const draw_count_display = document.querySelector('#draw');

    let board = [];
    let currentPlayer = 1;
    let game_active = false;
    let blocking_phase = false;
    let blocked_column_index = -1;
    let playerTimes = { 1: timer, 2: timer };
    let timerInterval;
    let leaderboard = {
        red_P_win: 0,
        yellow_P_win: 0,
        draw: 0,
    };
    
    const player_1_color = 'red';
    const player_2_color = 'yellow';

    function time_format(seconds) {
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        
    }

    function update_timer_display() {
        
        red_p_timer.textContent = time_format(playerTimes[1]);
        yellow_p_timer.textContent = time_format(playerTimes[2]);
    }

    function startTimer() {
        
        stopTimer();
        
        timerInterval = setInterval(() => {
            playerTimes[currentPlayer]--;
            update_timer_display();
            if (playerTimes[currentPlayer] <= 0) {
                stopTimer();
                endGame(3 - currentPlayer);
            }
        }, 1000);
    }

    function stopTimer() {
        
        clearInterval(timerInterval);
    }

    function createBoard() {
        
        game_board.innerHTML = '';
        
        board = Array(rows).fill(0).map(() => Array(columns).fill(0));

        for (let c = 0; c < columns; c++) {
            
            const columnEl = document.createElement('div');
            
            columnEl.classList.add('column');
            columnEl.dataset.column = c;
            columnEl.addEventListener('click', ColumnClick);

            for (let r = 0; r < rows; r++) {
                
                const slotEl = document.createElement('div');
                slotEl.classList.add('slot');
                columnEl.appendChild(slotEl);
            }
            
            game_board.appendChild(columnEl);
        }
    }

    function isColumnFull(c) {
        
        return board[rows - 1][c] !== 0;
    }

    function renderBoard() {
        
        for (let c = 0; c < columns; c++) {
            
            const columnEl = game_board.querySelector(`.column[data-column='${c}']`);

            if (parseInt(columnEl.dataset.column) === blocked_column_index) {
                
                columnEl.classList.add('blocked');
            } 
             else {

                 
                columnEl.classList.remove('blocked');
            }

            if (isColumnFull(c)) {
                
                columnEl.classList.add('full');
                
            }
            else {
                columnEl.classList.remove('full');
            }

            const slots = columnEl.querySelectorAll('.slot');
            
            for (let r = 0; r < rows; r++) {
                
                let discEl = slots[r].querySelector('.disc');

                if (board[r][c] === 1) {
                    
                    if (!discEl || !discEl.classList.contains(player_1_color)) {
                        
                        if (discEl) discEl.remove();
                        
                        const newDisc = document.createElement('div');
                        
                        newDisc.classList.add('disc', player_1_color);
                        
                        slots[r].appendChild(newDisc);
                    }
                }
                else if (board[r][c] === 2) {
                    
                  if (!discEl || !discEl.classList.contains(player_2_color)) {
                      
                        if (discEl) discEl.remove();
                      
                        const newDisc = document.createElement('div');
                        newDisc.classList.add('disc', player_2_color);
                      
                        slots[r].appendChild(newDisc);
                    }
                } 
                 else {
                    if (discEl) {
                        
                        discEl.remove();
                        
                     }
                }
             }
     }
}

function getNextAvailableRow(col) {
    
    for (let r = 0; r < rows; r++) {
        
        if (board[r][col] === 0) {
                return r;
            }
        }
        return -1;
    }

function checkWin(row, col, player) {
    
    for (let c = 0; c < columns - winlength + 1; c++) {
        
            let count = 0;
        
            for (let i = 0; i < winlength; i++) {
                
                if (board[row][c + i] === player) {
                    count++;
                } 
                else {
                    count = 0;
                }
                
                if (count === winlength) return true;
            }
        }

        for (let r = 0; r < rows - winlength + 1; r++) {
            
            let count = 0;
            for (let i = 0; i < winlength; i++) {
                
                if (board[r + i][col] === player) {
                    count++;
                }
                else {
                    count = 0;
                }
                
                if (count === winlength) return true;
              }
        }

        for (let r = 0; r <= rows - winlength; r++) {

            for (let c = 0; c <= columns - winlength; c++) {
                
                let count = 0;
                for (let i = 0; i < winlength; i++) {
                    
                    if (board[r + i][c + i] === player) {
                        count++;
                    } else {
                        count = 0;
                    }
                    
                    if (count === winlength) return true;
                    
                  }
             }
 }

   for (let r = 0; r <= rows - winlength; r++) {
       
        for (let c = winlength - 1; c < columns; c++) {
            
            let count = 0;
            for (let i = 0; i < winlength; i++) {
                
                  if (board[r + i][c - i] === player) {
                        count++;
                    } else {
                        count = 0;
                    }
                
                  
                if (count === winlength) return true;
                
                 }
        }
   }

        return false;
}

function checkDraw() {
    
       for (let c = 0; c < columns; c++) {
            
            if (!isColumnFull(c)) {
                return false;
            } 
        }
        return true;
    }

function updateLeaderboard() {
    
    red_p_win_display.textContent = leaderboard.red_P_win;
    
     yellow_p_win_display.textContent = leaderboard.yellow_P_win;
    draw_count_display.textContent = leaderboard.draw;

    
    }

function endGame(winnerPlayer = 0) {
    
        game_active = false;
    
        stopTimer();

        let message = '';
        let title = 'Game Over!';

    if (winnerPlayer === 1) {
            message = 'Player 1 (Red) Wins!';
            leaderboard.red_P_win++;
        
     } else if (winnerPlayer === 2) {
        
            message = 'Player 2 (Yellow) Wins!';
            leaderboard.yellow_P_win++;
        } 
    else {
            message = "It's a Draw!";
            leaderboard.draw++;
     }

        updateLeaderboard();

    
        game_over_title.textContent = title;
    
        game_over_message.textContent = message;
        game_over_modal.classList.add('show');
    }

 function startGame() {
     
         resetGame();
     
        game_active = true;
     
        start_btn.style.display = 'none';
        reset_btn.style.display = 'inline-block';

        game_message.textContent = `Player 2 (Yellow) to block a column for Player 1 (Red).`;
     
        red_p_status.classList.remove('active');
        yellow_p_status.classList.add('active');

        blocking_phase = true;
        show_blocked_column(2);
    }

function startGameTurn() {
    
    game_message.textContent = `Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Yellow'})'s turn to drop a disc.`;
    
    if (currentPlayer === 1) {
        
            red_p_status.classList.add('active');
            yellow_p_status.classList.remove('active');
        
    } 
    else {
            red_p_status.classList.remove('active');
            yellow_p_status.classList.add('active');
        }
    
        startTimer();
    
    }

    function resetGame() {
        
        stopTimer();
        
        playerTimes = { 1: timer, 2: timer };
        currentPlayer = 1;
        blocked_column_index = -1;
        
        game_active = false;
        blocking_phase = false;

        createBoard();
        renderBoard();
        update_timer_display();

        game_message.textContent = "Click 'Start Game' to begin!";
        
        red_p_status.classList.remove('active');
        yellow_p_status.classList.remove('active');
        
        start_btn.style.display = 'inline-block';
        reset_btn.style.display = 'none';
        
        game_over_modal.classList.remove('show');
        
        updateLeaderboard();
 }

function switchTurn() {
    
    stopTimer();
         currentPlayer = 3 - currentPlayer;

        if (currentPlayer === 1) {
            
            red_p_status.classList.add('active');
            yellow_p_status.classList.remove('active');
            
        } 
        else{
            
            red_p_status.classList.remove('active');
            yellow_p_status.classList.add('active');
        }

        blocking_phase = true;
    
        game_message.textContent = `Player ${3 - currentPlayer} (${3 - currentPlayer === 1 ? 'Red' : 'Yellow'}) to block a column for Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Yellow'}).`;
    
        show_blocked_column(3 - currentPlayer);
    }

function show_blocked_column(blockingPlayer) {
    
        block_column_title.textContent = `Player ${blockingPlayer} (${blockingPlayer === 1 ? 'Red' : 'Yellow'}), select a column to block!`;
    
        block_column_btn.innerHTML = '';

        let playableColumnsCount = 0;
    
        for (let c = 0; c < columns; c++) {
            
            if (!isColumnFull(c)) {
                playableColumnsCount++;
            }
        }

        if (playableColumnsCount <= 1) {
            
            blocked_column_index = -1;
            game_message.textContent = `No column could be blocked this turn, as only ${playableColumnsCount} playable option(s) remain for Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Yellow'}).`;
            block_column_modal.classList.remove('show');
            
            setTimeout(() => {
                startGameTurn();
            }, 2000);

            
            return;
        }

           for (let c = 0; c < columns; c++) {
            
            const blockButton = document.createElement('button');
               
            blockButton.textContent = `Column ${c + 1}`;
            blockButton.dataset.column = c;
            blockButton.classList.add('column-block-btn');

            if (isColumnFull(c)) {
                
                blockButton.disabled = true;
                blockButton.style.opacity = '0.6';
                blockButton.style.cursor = 'not-allowed';
            }

            blockButton.addEventListener('click', () => {
                handleBlockColumn(c);
            });
               
            block_column_btn.appendChild(blockButton);
               
        }
    
        block_column_modal.classList.add('show');
    }

function BlockColumn(col) {
        
        blocked_column_index = col;
        
        blocking_phase = false;
        block_column_modal.classList.remove('show');

        game_message.textContent = `Column ${col + 1} is blocked for this turn! Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Yellow'})'s turn to drop a disc.`;
        
        renderBoard();
        startGameTurn();
    }

    column_close_btn.addEventListener('click', () => {
        
        if (blocking_phase) {
            
            game_message.textContent = "You must select a column to block! Please choose one.";
            block_column_modal.classList.add('show');
            
        }
        else {
            block_column_modal.classList.remove('show');
        }
    });

    function ColumnClick(event) {
        
        if (!game_active || blocking_phase) {
            
            if (blocking_phase) {
                
                game_message.textContent = `Please select a column to block first!`;
            }
            
            return;
        }

        const clickedColumn = parseInt(event.currentTarget.dataset.column);

        if (clickedColumn === blocked_column_index) {
            
            game_message.textContent = `Column ${clickedColumn + 1} is blocked for this turn! Choose another column.`;
            return;
            
        }

        const rowToDrop = getNextAvailableRow(clickedColumn);

        if (rowToDrop === -1) {
            
            game_message.textContent = `Column ${clickedColumn + 1} is FULL! Choose another column.`;
            return;
            
        }

        board[rowToDrop][clickedColumn] = currentPlayer;
        
        renderBoard();

        if (checkWin(rowToDrop, clickedColumn, currentPlayer)) {
            
            game_message.textContent = `Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Yellow'}) Wins!`;
            
            endGame(currentPlayer);
            
        } 
        else if (checkDraw()) {
            
            game_message.textContent = "It's a Draw!";
            endGame(0);
        } 
        else {
            
            blocked_column_index = -1;
            switchTurn();
        }
    }

    start_btn.addEventListener('click', startGame);
    reset_btn.addEventListener('click', resetGame);
    
    play_again_btn.addEventListener('click', startGame);
    close_btn.addEventListener('click', () => game_over_modal.classList.remove('show'));

    resetGame();
});
