// HTML 요소 가져오기
const board = document.getElementById('chessboard');
const turnDisplay = document.getElementById('turn');
const phaseDisplay = document.getElementById('phase');
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const whiteGauge = document.getElementById('white-gauge');
const blackGauge = document.getElementById('black-gauge');
const whiteValue = document.getElementById('white-value');
const blackValue = document.getElementById('black-value');
const diceAnimation = document.getElementById('dice-animation');
const cancelButton = document.getElementById('cancel-button');
const startScreen = document.querySelector('.start-screen');
const difficultyScreen = document.querySelector('.difficulty-screen');
const customScreen = document.querySelector('.custom-screen');
const helpScreen = document.querySelector('.help-screen');
const container = document.querySelector('.container');
const endGameScreen = document.querySelector('.end-game-screen');
const captureSound = document.getElementById('captureSound');

// 체스 말 이미지
const pieceImages = {
    '♔': '<img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♕': '<img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♖': '<img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♗': '<img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♘': '<img src="https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♙': '<img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♚': '<img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♛': '<img src="https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♜': '<img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♝': '<img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♞': '<img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg" width="30">', // 모바일에 맞춰 크기 줄임
    '♟': '<img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg" width="30">' // 모바일에 맞춰 크기 줄임
};

// 체스 말 배열
const pieces = [
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
];

// 게임 상태
let boardState = pieces.slice();
let selectedSquare = null;
let moved = { whiteKing: false, whiteLeftRook: false, whiteRightRook: false, blackKing: false, blackLeftRook: false, blackRightRook: false };
let lastMove = null;
let turn = 'black'; // 흑팀부터 시작
let turnCount = 0;
let timeLeft = 30;
let timerInterval = null;
let diceTotal = { white: 0, black: 0 }; // 팀별 주사위 합 누적 (최대 제한 없음)
let extraTurn = false; // 연속 턴 플래그 (true: 첫 번째 턴, false: 두 번째 턴)
let phase = 'dice'; // 'dice' 또는 'move' 단계
let isVsBot = false; // 봇 대전 여부
let botDifficulty = 'easy'; // 봇 난이도 (기본: 초급)
let isCustom = false; // 커스텀 모드 여부

// 64칸 만들기
const squares = [];
for (let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    if ((Math.floor(i / 8) + i) % 2 === 0) square.classList.add('white');
    else square.classList.add('black');
    square.innerHTML = boardState[i] ? pieceImages[boardState[i]] : '';
    square.dataset.index = i;
    squares.push(square);
    board.appendChild(square);
}

// 시작 화면 함수
function showModeSelect() {
    startScreen.style.display = 'none';
    difficultyScreen.style.display = 'none';
    customScreen.style.display = 'flex';
}

function startGame(difficulty) {
    isVsBot = true;
    botDifficulty = difficulty;
    isCustom = false;
    difficultyScreen.style.display = 'none';
    customScreen.style.display = 'none';
    container.style.display = 'flex';
    initializeGame();
}

function startCustomGame() {
    isVsBot = false;
    isCustom = true;
    customScreen.style.display = 'none';
    container.style.display = 'flex';
    initializeGame();
}

function hideModeSelect() {
    difficultyScreen.style.display = 'none';
    customScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

function returnToMain() {
    container.style.display = 'none';
    startScreen.style.display = 'flex';
    if (timerInterval) clearInterval(timerInterval);
    diceTotal = { white: 0, black: 0 }; // 게이지 초기화
    isVsBot = false;
    isCustom = false;
    updateGauge();
}

function returnToModeSelect() {
    container.style.display = 'none';
    startScreen.style.display = 'flex';
    if (timerInterval) clearInterval(timerInterval);
    diceTotal = { white: 0, black: 0 }; // 게이지 초기화
    isVsBot = false;
    isCustom = false;
    updateGauge();
}

function showHelp() {
    helpScreen.style.display = 'flex';
    startScreen.style.display = 'none';
}

function hideHelp() {
    helpScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

function showEndGame() {
    endGameScreen.style.display = 'flex';
    container.style.display = 'none';
}

function hideEndGame() {
    endGameScreen.style.display = 'none';
    container.style.display = 'flex';
}

function returnToMainAfterGame() {
    hideEndGame();
    returnToMain();
}

// 게임 초기화
function initializeGame() {
    boardState = pieces.slice();
    selectedSquare = null;
    moved = { whiteKing: false, whiteLeftRook: false, whiteRightRook: false, blackKing: false, blackLeftRook: false, blackRightRook: false };
    lastMove = null;
    turn = 'black'; // 흑팀부터 시작
    turnCount = 0;
    timeLeft = 30;
    diceTotal = { white: 0, black: 0 };
    extraTurn = false;
    phase = 'dice';
    updateBoard();
    turnDisplay.textContent = "현재 차례: " + (turn === 'white' ? '백' : '흑');
    phaseDisplay.textContent = `상태: 주사위 던지기`;
    timerDisplay.textContent = `남은 시간: ${timeLeft}초`;
    statusDisplay.textContent = '';
    diceAnimation.textContent = '';
    updateGauge();
    startTimer();
    if (isVsBot && turn === 'black') botMove(); // 봇이 흑일 경우 즉시 이동
}

// 보드 업데이트
function updateBoard() {
    for (let i = 0; i < 64; i++) {
        squares[i].innerHTML = boardState[i] ? pieceImages[boardState[i]] : '';
        squares[i].classList.remove('selected', 'highlight', 'captured', 'pawn-move');
    }
}

// 주사위 애니메이션 (2~12 랜덤, 간혹 특별 보너스, 누적은 제한 없음)
function rollDiceAnimation() {
    return new Promise(resolve => {
        diceAnimation.textContent = '';
        let total;
        // 5% 확률로 특별 보너스 (2~12 외의 값, 예: 20)
        if (Math.random() < 0.05) { // 5% 확률
            total = Math.floor(Math.random() * 81) + 20; // 20~100 사이 특별 보너스
            statusDisplay.textContent = `특별 보너스! 🎉 누적: ${diceTotal[turn] + total}`;
        } else {
            total = Math.floor(Math.random() * 11) + 2; // 2~12 사이 랜덤 숫자 (2, 3, ..., 12)
            if (total < 2 || total > 12) {
                console.error('주사위 값 오류: 예상 범위(2~12) 밖 값 발생 -', total);
                total = Math.min(Math.max(total, 2), 12); // 2~12로 강제로 제한
            }
            statusDisplay.textContent = `누적: ${diceTotal[turn] + total}`; // 누적 값만 표시
        }
        diceTotal[turn] += total; // 해당 팀에 누적 (최대 제한 없음)
        updateGauge();
        if (diceTotal[turn] >= 100) {
            diceTotal[turn] = 0; // 100 이상 시 초기화
            extraTurn = true; // 첫 번째 연속 턴 활성화
            statusDisplay.classList.add('extra-turn'); // 연속 턴 UI 효과
            statusDisplay.textContent = '연속 2번 턴 가능! (두 번째 턴은 킹과 폰만 이동 가능)';
            predictNextTurn();
        }
        setTimeout(() => {
            phase = 'move'; // 주사위 후 이동 단계
            phaseDisplay.textContent = `상태: 말 움직이기`;
            resolve(total);
            if (isVsBot && turn === 'black') botMove(); // 봇 턴이면 이동
        }, 800); // 모바일 성능을 위해 애니메이션 시간 줄임 (1초 → 0.8초)
    });
}

// 게이지 업데이트 (격투게임 HP 스타일, 최대 제한 없음)
function updateGauge() {
    const whitePercent = diceTotal['white'] / 100 * 100; // 100을 기준으로 퍼센트 계산 (최대 제한 없음)
    const blackPercent = diceTotal['black'] / 100 * 100; // 100을 기준으로 퍼센트 계산 (최대 제한 없음)
    whiteGauge.style.width = `${whitePercent}%`;
    blackGauge.style.width = `${blackPercent}%`;
    whiteValue.textContent = `${diceTotal['white']}`; // 실제 누적 값 표시
    blackValue.textContent = `${diceTotal['black']}`; // 실제 누적 값 표시
    if (diceTotal['white'] >= 100) whiteGauge.style.background = 'linear-gradient(to right, #FF5722, #ff8a8a)';
    else whiteGauge.style.background = 'linear-gradient(to right, #F0E68C, #ffd700)';
    if (diceTotal['black'] >= 100) blackGauge.style.background = 'linear-gradient(to right, #FF5722, #ff4d4d)';
    else blackGauge.style.background = 'linear-gradient(to right, #8B4513, #ff4d4d)';
}

// 다음 턴 예측
function predictNextTurn() {
    const nextTurn = turn === 'white' ? 'black' : 'white';
    const minNextRoll = 2; // 최소 2
    const maxNextRoll = 12; // 최대 12 (특별 보너스는 예측하지 않음)
    if (100 - diceTotal[nextTurn] <= maxNextRoll) {
        statusDisplay.textContent += ` - 다음 차례(${nextTurn === 'white' ? '백' : '흑'}) 연속 가능!`;
    }
}

// 타이머 (setInterval로 수정, 모바일 성능 고려)
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 30;
    timerDisplay.textContent = `남은 시간: ${timeLeft}초`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `남은 시간: ${timeLeft}초`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`${turn === 'white' ? '백' : '흑'}의 시간 초과! 턴이 넘어갑니다.`);
            changeTurn();
            startTimer();
            if (isVsBot && turn === 'black') botMove(); // 봇 턴 시작
        }
    }, 1000);
}

// 이동 가능 칸 하이라이트 (연속 턴 조건 적용)
function highlightMoves(from) {
    squares.forEach(square => square.classList.remove('highlight'));
    if (extraTurn === false && phase === 'move') {
        // 두 번째 연속 턴에서는 킹과 폰만 이동 가능
        const piece = boardState[from];
        if (piece !== '♔' && piece !== '♙' && piece !== '♚' && piece !== '♟') {
            statusDisplay.textContent = '두 번째 연속 턴에서는 킹과 폰만 이동 가능합니다!';
            return;
        }
    }
    const validMoves = getValidMoves(from);
    validMoves.forEach(to => {
        squares[to].classList.add('highlight');
    });
}

// 유효 이동 가져오기
function getValidMoves(from) {
    const moves = [];
    for (let to = 0; to < 64; to++) {
        if (isValidMove(from, to) || isValidCastling(from, to)) {
            moves.push(to);
        }
    }
    return moves;
}

// 클릭 및 터치 이벤트 (모바일 지원)
squares.forEach(square => {
    square.addEventListener('click', handleSquareClick); // 데스크톱 클릭
    square.addEventListener('touchend', handleSquareTouch); // 모바일 터치
});

function handleSquareClick(event) {
    handleSquareInteraction(event, parseInt(this.dataset.index));
}

function handleSquareTouch(event) {
    event.preventDefault(); // 터치 이벤트 중복 방지
    handleSquareInteraction(event, parseInt(this.dataset.index));
}

function handleSquareInteraction(event, index) {
    if (phase === 'dice') {
        if (diceAnimation.textContent === '') {
            rollDiceAnimation().then(() => startTimer()); // 주사위 던지기 시작
        } else {
            alert('이미 주사위를 던졌습니다! 말을 움직이세요.');
        }
        return;
    }

    if (selectedSquare === null) {
        if (boardState[index] !== '' && 
            ((turn === 'white' && boardState[index] >= '♔' && boardState[index] <= '♙') ||
             (turn === 'black' && boardState[index] >= '♚' && boardState[index] <= '♟'))) {
            selectedSquare = index;
            squares[index].classList.add('selected');
            highlightMoves(index);
        }
    } else {
        const fromIndex = selectedSquare;
        const toIndex = index;

        // 다른 기물 선택 가능 (선택 유지 후 새 선택)
        if (boardState[index] !== '' && 
            ((turn === 'white' && boardState[index] >= '♔' && boardState[index] <= '♙') ||
             (turn === 'black' && boardState[index] >= '♚' && boardState[index] <= '♟'))) {
            squares[fromIndex].classList.remove('selected');
            squares.forEach(s => s.classList.remove('highlight'));
            selectedSquare = index;
            squares[index].classList.add('selected');
            highlightMoves(index);
            return;
        }

        // 같은 말을 다시 클릭해도 선택 유지
        if (index === fromIndex) {
            return; // 아무 동작 안 함, 선택 유지
        }

        if (squares[toIndex].classList.contains('highlight')) {
            const piece = boardState[fromIndex];
            if (extraTurn === false && piece !== '♔' && piece !== '♙' && piece !== '♚' && piece !== '♟') {
                alert('두 번째 연속 턴에서는 킹과 폰만 이동 가능합니다!');
                return;
            }

            const tempBoard = boardState.slice();
            let isCastling = isValidCastling(fromIndex, toIndex);

            if (isCastling) {
                handleCastling(fromIndex, toIndex);
            } else {
                if (isEnPassant(fromIndex, toIndex)) {
                    handleEnPassant(fromIndex, toIndex);
                } else {
                    boardState[toIndex] = boardState[fromIndex];
                    boardState[fromIndex] = '';
                    if (piece === '♙' || piece === '♟') {
                        squares[toIndex].innerHTML = `<div class="pawn-move">${pieceImages[boardState[toIndex]]}</div>`;
                        setTimeout(() => squares[toIndex].classList.remove('pawn-move'), 500); // 애니메이션 0.5초 후 제거
                    } else {
                        squares[toIndex].innerHTML = pieceImages[boardState[toIndex]];
                    }
                    squares[fromIndex].innerHTML = '';
                    if (isPawnPromotion(toIndex)) {
                        boardState[toIndex] = (turn === 'white') ? '♕' : '♛';
                        squares[toIndex].innerHTML = pieceImages[boardState[toIndex]];
                    }
                }
            }

            updateMovedStatus(fromIndex);
            lastMove = { from: fromIndex, to: toIndex };

            // 킹 잡기 체크 및 애니메이션, 사운드
            if (isKingCaptured()) {
                const capturedKingPos = turn === 'white' ? boardState.indexOf('♚') : boardState.indexOf('♔');
                if (capturedKingPos !== -1) {
                    squares[capturedKingPos].classList.add('captured'); // 깜빡임 애니메이션
                    captureSound.play(); // 사운드 재생
                    setTimeout(() => squares[capturedKingPos].classList.remove('captured'), 2000); // 모바일 성능을 위해 애니메이션 시간 줄임 (3초 → 2초)
                }
                clearInterval(timerInterval);
                const winner = turn === 'white' ? '백' : '흑';
                statusDisplay.textContent = `${winner} 승리! 킹 잡음!`;
                alert(`${winner} 승리! 킹 잡음!`);
                showEndGame(); // 게임 종료 후 확인 화면 표시
                return;
            }

            if (isKingInCheck(turn === 'white' ? 'black' : 'white')) {
                statusDisplay.textContent = '체크 상태!';
                if (isCheckmate(turn === 'white' ? 'black' : 'white')) {
                    clearInterval(timerInterval);
                    const winner = turn === 'white' ? '백' : '흑';
                    statusDisplay.textContent = `${winner} 승리! 체크메이트!`;
                    alert(`${winner} 승리! 체크메이트!`);
                    showEndGame(); // 게임 종료 후 확인 화면 표시
                    return;
                }
            } else {
                statusDisplay.textContent = '';
                if (isStalemate(turn === 'white' ? 'black' : 'white')) {
                    clearInterval(timerInterval);
                    statusDisplay.textContent = '무승부! 스테일메이트!';
                    alert('무승부! 스테일메이트!');
                    showEndGame(); // 게임 종료 후 확인 화면 표시
                    return;
                }
            }

            squares.forEach(s => s.classList.remove('highlight', 'selected'));
            selectedSquare = null;
            if (extraTurn) {
                // 첫 번째 연속 턴 후 두 번째 턴으로 전환
                extraTurn = false; // 두 번째 턴으로 전환 (킹과 폰만 가능)
                statusDisplay.classList.add('extra-turn');
                statusDisplay.textContent = `연속 턴 1/2 완료. 두 번째 턴은 킹 또는 폰만 이동 가능합니다.`;
                startTimer();
            } else if (extraTurn === false && phase === 'move') {
                // 두 번째 연속 턴 후 턴 종료
                extraTurn = false;
                statusDisplay.classList.remove('extra-turn');
                phase = 'dice'; // 두 번째 이동 후 주사위 단계로 전환
                phaseDisplay.textContent = `상태: 주사위 던지기`;
                changeTurn();
                rollDiceAnimation().then(() => startTimer());
                if (isVsBot && turn === 'black') botMove(); // 봇 턴 시작
            } else {
                phase = 'dice'; // 일반 이동 후 다시 주사위 단계
                phaseDisplay.textContent = `상태: 주사위 던지기`;
                changeTurn();
                rollDiceAnimation().then(() => startTimer());
                if (isVsBot && turn === 'black') botMove(); // 봇 턴 시작
            }
        }
    }
});

// 버튼에 터치 이벤트 추가
cancelButton.addEventListener('click', handleCancelClick);
cancelButton.addEventListener('touchend', handleCancelTouch);

function handleCancelClick() {
    handleCancelInteraction();
}

function handleCancelTouch(event) {
    event.preventDefault(); // 터치 이벤트 중복 방지
    handleCancelInteraction();
}

function handleCancelInteraction() {
    if (selectedSquare !== null && phase === 'move') {
        squares[selectedSquare].classList.remove('selected');
        squares.forEach(square => square.classList.remove('highlight'));
        selectedSquare = null;
        statusDisplay.textContent = `선택이 취소되었습니다.`;
    } else {
        alert('선택된 말이 없습니다 또는 주사위 단계입니다.');
    }
}

// 킹 잡기 체크 및 애니메이션
function isKingCaptured() {
    const whiteKing = boardState.indexOf('♔');
    const blackKing = boardState.indexOf('♚');
    if (turn === 'white' && blackKing === -1) return true; // 흑 킹 잡음
    if (turn === 'black' && whiteKing === -1) return true; // 백 킹 잡음
    return false;
}

// 봇 이동 로직 (Minimax + Alpha-Beta 최적화, 자동화 강화, 모바일 성능 최적화)
function botMove() {
    if (phase !== 'move' || !isVsBot || turn !== 'black') return;

    setTimeout(() => {
        const depth = getDepthForDifficulty(botDifficulty); // 난이도에 따른 검색 깊이
        const { bestMove } = minimax(boardState, depth, -Infinity, Infinity, true, 0);
        
        if (bestMove) {
            const { from, to } = bestMove;
            selectedSquare = from;
            squares[from].classList.add('selected');
            highlightMoves(from);
            setTimeout(() => {
                squares[to].click(); // 봇 이동 실행 (터치 이벤트 호환)
                if (timerInterval) clearInterval(timerInterval); // 타이머 중복 방지
                startTimer(); // 새 타이머 시작
            }, 400); // 모바일 성능을 위해 대기 시간 줄임 (0.5초 → 0.4초)
        } else {
            // 이동할 수 없으면 턴 종료
            changeTurn();
            rollDiceAnimation().then(() => startTimer());
            if (isVsBot && turn === 'black') botMove(); // 다음 봇 턴
        }
    }, 800); // 모바일 성능을 위해 대기 시간 줄임 (1초 → 0.8초)
}

// 난이도별 검색 깊이
function getDepthForDifficulty(difficulty) {
    switch (difficulty) {
        case 'beginner': return 1; // 얕은 검색 (모바일 성능 최적화)
        case 'easy': return 2;
        case 'medium': return 2; // 중급도 모바일 성능 위해 깊이 줄임
        case 'hard': return 3;
        case 'pro': return 4; // 프로는 유지, 성능에 따라 조정 필요
        default: return 2;
    }
}

// Minimax 알고리즘 (Alpha-Beta 가지치기 포함, 최적화, 모바일 성능 고려)
function minimax(board, depth, alpha, beta, maximizingPlayer, movesCount) {
    if (depth === 0 || isGameOver(board) || movesCount >= 50) { // 이동 수 제한 줄임 (성능 최적화)
        return { score: evaluateBoard(board), bestMove: null };
    }

    let bestMove = null;
    if (maximizingPlayer) { // 봇(흑)의 최대화
        let maxEval = -Infinity;
        for (let from = 0; from < 64; from++) {
            if (board[from] && board[from] >= '♚' && board[from] <= '♟') {
                const moves = getValidMoves(from);
                for (let to of moves) {
                    const tempBoard = board.slice();
                    let isCastling = isValidCastling(from, to);

                    if (isCastling) {
                        handleCastling(from, to, tempBoard);
                    } else {
                        if (isEnPassant(from, to)) {
                            handleEnPassant(from, to, tempBoard);
                        } else {
                            tempBoard[to] = tempBoard[from];
                            tempBoard[from] = '';
                            if (isPawnPromotion(to)) tempBoard[to] = '♛';
                        }
                    }

                    const evaluation = minimax(tempBoard, depth - 1, alpha, beta, false, movesCount + 1);
                    if (evaluation.score > maxEval) {
                        maxEval = evaluation.score;
                        bestMove = { from, to };
                    }
                    alpha = Math.max(alpha, maxEval);
                    if (beta <= alpha) break; // Alpha-Beta 가지치기
                }
            }
        }
        return { score: maxEval, bestMove };
    } else { // 플레이어(백)의 최소화
        let minEval = Infinity;
        for (let from = 0; from < 64; from++) {
            if (board[from] && board[from] >= '♔' && board[from] <= '♙') {
                const moves = getValidMoves(from);
                for (let to of moves) {
                    const tempBoard = board.slice();
                    let isCastling = isValidCastling(from, to);

                    if (isCastling) {
                        handleCastling(from, to, tempBoard);
                    } else {
                        if (isEnPassant(from, to)) {
                            handleEnPassant(from, to, tempBoard);
                        } else {
                            tempBoard[to] = tempBoard[from];
                            tempBoard[from] = '';
                            if (isPawnPromotion(to)) tempBoard[to] = '♕';
                        }
                    }

                    const evaluation = minimax(tempBoard, depth - 1, alpha, beta, true, movesCount + 1);
                    if (evaluation.score < minEval) {
                        minEval = evaluation.score;
                        bestMove = { from, to };
                    }
                    beta = Math.min(beta, minEval);
                    if (beta <= alpha) break; // Alpha-Beta 가지치기
                }
            }
        }
        return { score: minEval, bestMove };
    }
}

// 게임 종료 체크
function isGameOver(board) {
    const whiteKing = board.indexOf('♔');
    const blackKing = board.indexOf('♚');
    return whiteKing === -1 || blackKing === -1 || isCheckmate('white') || isCheckmate('black') || isStalemate('white') || isStalemate('black');
}

// 보드 평가 (강화된 버전, 모바일 성능 고려)
function evaluateBoard(board) {
    let score = 0;
    const pieceValues = {
        '♔': 1000, '♚': -1000,
        '♕': 9, '♛': -9,
        '♖': 5, '♜': -5,
        '♗': 3, '♝': -3,
        '♘': 3, '♞': -3,
        '♙': 1, '♟': -1
    };

    for (let i = 0; i < 64; i++) {
        if (board[i]) score += pieceValues[board[i]] || 0;
    }

    const positionBonus = evaluatePosition(board);
    const checkThreat = evaluateCheckThreat(board);
    return score + positionBonus * 1 + checkThreat * 1; // 가중치 줄여 성능 최적화
}

// 위치 가중치 평가 (강화, 간소화)
function evaluatePosition(board) {
    let score = 0;
    const positionValues = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [30, 30, 30, 30, 30, 30, 30, 30],
        [5, 5, 10, 15, 15, 10, 5, 5],
        [2, 2, 5, 10, 10, 5, 2, 2],
        [0, 0, 0, 5, 5, 0, 0, 0],
        [2, -2, -5, 0, 0, -5, -2, 2],
        [5, 5, 5, -10, -10, 5, 5, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    for (let i = 0; i < 64; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;
        if (board[i] === '♙') score += positionValues[row][col] * 0.05; // 백 폰 (가중치 줄임)
        if (board[i] === '♟') score -= positionValues[7 - row][col] * 0.05; // 흑 폰 (가중치 줄임)
        if (board[i] === '♘' || board[i] === '♞') {
            score += (board[i] === '♘' ? 1 : -1) * positionValues[row][col] * 0.03; // 나이트 위치 (가중치 줄임)
        }
        if (board[i] === '♗' || board[i] === '♝') {
            score += (board[i] === '♗' ? 1 : -1) * positionValues[row][col] * 0.02; // 비숍 위치 (가중치 줄임)
        }
    }
    return score;
}

// 체크 위협 평가 (강화, 간소화)
function evaluateCheckThreat(board) {
    let score = 0;
    for (let i = 0; i < 64; i++) {
        if (board[i] && board[i] >= '♚' && board[i] <= '♟') {
            const moves = getValidMoves(i);
            for (let to of moves) {
                if (board[to] === '♔') score -= 50; // 흑이 백 킹 위협 (가중치 줄임)
            }
        }
    }
    for (let i = 0; i < 64; i++) {
        if (board[i] && board[i] >= '♔' && board[i] <= '♙') {
            const moves = getValidMoves(i);
            for (let to of moves) {
                if (board[to] === '♚') score += 50; // 백이 흑 킹 위협 (가중치 줄임)
            }
        }
    }
    return score;
}

// 이동 규칙
function isValidMove(from, to) {
    const piece = boardState[from];
    const rowDiff = Math.floor(to / 8) - Math.floor(from / 8);
    const colDiff = (to % 8) - (from % 8);
    const rowAbs = Math.abs(rowDiff);
    const colAbs = Math.abs(colDiff);
    const toPiece = boardState[to];

    if (!isPathClear(from, to)) return false;

    if (piece === '♙') {
        if (rowDiff === -1 && colDiff === 0 && toPiece === '') return true;
        if (rowDiff === -2 && colDiff === 0 && Math.floor(from / 8) === 6 && toPiece === '' && boardState[from - 8] === '') return true;
        if (rowDiff === -1 && colAbs === 1 && toPiece !== '' && toPiece >= '♚' && toPiece <= '♟') return true;
    }
    if (piece === '♟') {
        if (rowDiff === 1 && colDiff === 0 && toPiece === '') return true;
        if (rowDiff === 2 && colDiff === 0 && Math.floor(from / 8) === 1 && toPiece === '' && boardState[from + 8] === '') return true;
        if (rowDiff === 1 && colAbs === 1 && toPiece !== '' && toPiece >= '♔' && toPiece <= '♙') return true;
    }
    if ((piece === '♔' || piece === '♚') && rowAbs <= 1 && colAbs <= 1 && (rowAbs + colAbs > 0)) return true;
    if ((piece === '♕' || piece === '♛') && 
        ((rowDiff === 0 && colDiff !== 0) || (colDiff === 0 && rowDiff !== 0) || (rowAbs === colAbs))) return true;
    if ((piece === '♖' || piece === '♜') && 
        ((rowDiff === 0 && colDiff !== 0) || (colDiff === 0 && rowDiff !== 0))) return true;
    if ((piece === '♘' || piece === '♞') && 
        ((rowAbs === 2 && colAbs === 1) || (rowAbs === 1 && colAbs === 2))) return true;
    if ((piece === '♗' || piece === '♝') && (rowAbs === colAbs)) return true;

    return false;
}

// 앙파상
function isEnPassant(from, to) {
    const piece = boardState[from];
    const rowDiff = Math.floor(to / 8) - Math.floor(from / 8);
    const colDiff = (to % 8) - (from % 8);
    const colAbs = Math.abs(colDiff);

    if (lastMove && (piece === '♙' || piece === '♟')) {
        const lastFrom = lastMove.from;
        const lastTo = lastMove.to;
        const lastPiece = boardState[lastTo];

        if (piece === '♙' && rowDiff === -1 && colAbs === 1 && boardState[to] === '' &&
            lastPiece === '♟' && Math.floor(lastFrom / 8) === 1 && Math.floor(lastTo / 8) === 3 &&
            to === lastTo - 8 && Math.abs(lastFrom - from) === 1) return true;

        if (piece === '♟' && rowDiff === 1 && colAbs === 1 && boardState[to] === '' &&
            lastPiece === '♙' && Math.floor(lastFrom / 8) === 6 && Math.floor(lastTo / 8) === 4 &&
            to === lastTo + 8 && Math.abs(lastFrom - from) === 1) return true;
    }
    return false;
}

function handleEnPassant(from, to, board = boardState) {
    board[to] = board[from];
    board[from] = '';
    board[lastMove.to] = '';
    updateBoardFromState(board);
}

function handleCastling(from, to, board = boardState) {
    if (turn === 'white') {
        if (to === 62) { board[62] = '♔'; board[61] = '♖'; board[60] = ''; board[63] = ''; }
        else if (to === 58) { board[58] = '♔'; board[59] = '♖'; board[60] = ''; board[56] = ''; }
    } else {
        if (to === 6) { board[6] = '♚'; board[5] = '♜'; board[4] = ''; board[7] = ''; }
        else if (to === 2) { board[2] = '♚'; board[3] = '♜'; board[4] = ''; board[0] = ''; }
    }
    updateBoardFromState(board);
}

// 보드 상태로 UI 업데이트
function updateBoardFromState(board) {
    for (let i = 0; i < 64; i++) {
        squares[i].innerHTML = board[i] ? pieceImages[board[i]] : '';
        squares[i].classList.remove('selected', 'highlight', 'captured', 'pawn-move');
    }
}

// 폰 승격
function isPawnPromotion(to) {
    const piece = boardState[to];
    return (piece === '♙' && Math.floor(to / 8) === 0) || (piece === '♟' && Math.floor(to / 8) === 7);
}

// 캐슬링
function isValidCastling(from, to) {
    const piece = boardState[from];
    if ((piece !== '♔' && piece !== '♚') || Math.abs(to - from) !== 2) return false;

    if (piece === '♔' && !moved.whiteKing && !isKingInCheck('white')) {
        if (to === 62 && !moved.whiteRightRook && boardState[61] === '' && boardState[62] === '' && !isSquareAttacked(61, 'black')) return true;
        if (to === 58 && !moved.whiteLeftRook && boardState[59] === '' && boardState[58] === '' && boardState[57] === '' && !isSquareAttacked(59, 'black')) return true;
    }
    if (piece === '♚' && !moved.blackKing && !isKingInCheck('black')) {
        if (to === 6 && !moved.blackRightRook && boardState[5] === '' && boardState[6] === '' && !isSquareAttacked(5, 'white')) return true;
        if (to === 2 && !moved.blackLeftRook && boardState[3] === '' && boardState[2] === '' && boardState[1] === '' && !isSquareAttacked(3, 'white')) return true;
    }
    return false;
}

// 체크 확인
function isKingInCheck(color) {
    const king = color === 'white' ? '♔' : '♚';
    const kingPos = boardState.indexOf(king);
    if (kingPos === -1) return false; // 킹이 없으면 체크 아님
    const opponent = color === 'white' ? 'black' : 'white';

    for (let i = 0; i < 64; i++) {
        if (boardState[i] !== '' && 
            ((opponent === 'white' && boardState[i] >= '♔' && boardState[i] <= '♙') ||
             (opponent === 'black' && boardState[i] >= '♚' && boardState[i] <= '♟'))) {
            if (isValidMove(i, kingPos)) return true;
        }
    }
    return false;
}

function isSquareAttacked(square, byColor) {
    for (let i = 0; i < 64; i++) {
        if (boardState[i] !== '' && 
            ((byColor === 'white' && boardState[i] >= '♔' && boardState[i] <= '♙') ||
             (byColor === 'black' && boardState[i] >= '♚' && boardState[i] <= '♟'))) {
            if (isValidMove(i, square)) return true;
        }
    }
    return false;
}

// 체크메이트 확인
function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;

    const king = color === 'white' ? '♔' : '♚';
    const kingPos = boardState.indexOf(king);
    if (kingPos === -1) return true; // 상대 킹이 없으면 체크메이트

    for (let from = 0; from < 64; from++) {
        if (boardState[from] !== '' && 
            ((color === 'white' && boardState[from] >= '♔' && boardState[from] <= '♙') ||
             (color === 'black' && boardState[from] >= '♚' && boardState[from] <= '♟'))) {
            for (let to = 0; to < 64; to++) {
                if (isValidMove(from, to) || isValidCastling(from, to)) {
                    const tempBoard = boardState.slice();
                    if (isValidCastling(from, to)) {
                        handleCastling(from, to, tempBoard);
                    } else {
                        tempBoard[to] = tempBoard[from];
                        tempBoard[from] = '';
                        if (isPawnPromotion(to)) tempBoard[to] = (color === 'white') ? '♕' : '♛';
                    }
                    const stillInCheck = isKingInCheck(color);
                    if (!stillInCheck) return false;
                }
            }
        }
    }
    return true;
}

// 스테일메이트 확인
function isStalemate(color) {
    if (isKingInCheck(color)) return false;

    const king = color === 'white' ? '♔' : '♚';
    if (boardState.indexOf(king) === -1) return false; // 킹이 없으면 스테일메이트 아님

    for (let from = 0; from < 64; from++) {
        if (boardState[from] !== '' && 
            ((color === 'white' && boardState[from] >= '♔' && boardState[from] <= '♙') ||
             (color === 'black' && boardState[from] >= '♚' && boardState[from] <= '♟'))) {
            for (let to = 0; to < 64; to++) {
                if (isValidMove(from, to) || isValidCastling(from, to)) {
                    const tempBoard = boardState.slice();
                    if (isValidCastling(from, to)) {
                        handleCastling(from, to, tempBoard);
                    } else {
                        tempBoard[to] = tempBoard[from];
                        tempBoard[from] = '';
                        if (isPawnPromotion(to)) tempBoard[to] = (color === 'white') ? '♕' : '♛';
                    }
                    const stillInCheck = isKingInCheck(color);
                    if (!stillInCheck) return false;
                }
            }
        }
    }
    return true;
}

// 이동 경로 확인
function isPathClear(from, to) {
    const piece = boardState[from];
    if (piece === '♘' || piece === '♞' || piece === '♔' || piece === '♚') return true;

    const rowFrom = Math.floor(from / 8);
    const colFrom = from % 8;
    const rowTo = Math.floor(to / 8);
    const colTo = to % 8;
    const rowStep = rowTo > rowFrom ? 1 : (rowTo < rowFrom ? -1 : 0);
    const colStep = colTo > colFrom ? 1 : (colTo < colFrom ? -1 : 0);

    let currentRow = rowFrom + rowStep;
    let currentCol = colFrom + colStep;

    while (currentRow !== rowTo || currentCol !== colTo) {
        const index = currentRow * 8 + currentCol;
        if (boardState[index] !== '') return false;
        currentRow += rowStep;
        currentCol += colStep;
    }
    return true;
}

function updateMovedStatus(from) {
    const piece = boardState[from];
    if (piece === '♔') moved.whiteKing = true;
    if (piece === '♚') moved.blackKing = true;
    if (piece === '♖' && from === 56) moved.whiteLeftRook = true;
    if (piece === '♖' && from === 63) moved.whiteRightRook = true;
    if (piece === '♜' && from === 0) moved.blackLeftRook = true;
    if (piece === '♜' && from === 7) moved.blackRightRook = true;
}

// 턴 바꾸기
function changeTurn() {
    turnCount++;
    console.log("지금 " + turnCount + "번째 턴이야!");

    turn = turn === 'white' ? 'black' : 'white';
    turnDisplay.textContent = "현재 차례: " + (turn === 'white' ? '백' : '흑');
    phase = 'dice'; // 새 턴 시작 시 주사위 단계
    phaseDisplay.textContent = `상태: 주사위 던지기`;
    rollDiceAnimation().then(() => startTimer());
    if (isVsBot && turn === 'black') botMove(); // 봇 턴이면 이동
    else if (isCustom && turn === 'black') {
        // 커스텀 모드에서는 두 번째 플레이어가 흑을 제어
        statusDisplay.textContent = `흑 차례 (사람 플레이어)`;
    }
}