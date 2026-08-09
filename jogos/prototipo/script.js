// Controle do Jogador (Professor)
const player = document.getElementById('player');
let playerX = 720; 
let playerY = 250;
const playerSpeed = 4;

// Dimensões do Hitbox do Professor ajustadas para andar ENTRE as carteiras
const playerWidth = 20;
const playerHeight = 28;

// Estado dos Conflitos
let activeNpc = null;
let solvedConflicts = 0;
const resolvedNpcs = new Set();

// Lista das 12 Carteiras Escolares na Sala (Barreiras Sólidas Impenetráveis)
const desks = [
    { x: 110, y: 150, w: 45, h: 55 }, { x: 110, y: 270, w: 45, h: 55 }, { x: 110, y: 390, w: 45, h: 55 },
    { x: 260, y: 150, w: 45, h: 55 }, { x: 260, y: 270, w: 45, h: 55 }, { x: 260, y: 390, w: 45, h: 55 },
    { x: 420, y: 150, w: 45, h: 55 }, { x: 420, y: 270, w: 45, h: 55 }, { x: 420, y: 390, w: 45, h: 55 },
    { x: 580, y: 150, w: 45, h: 55 }, { x: 580, y: 270, w: 45, h: 55 }, { x: 580, y: 390, w: 45, h: 55 }
];
const deskCollisionInset = 6;

// NPCs Alinhados exatamente nas cadeiras das mesas
const npcs = [
    { id: 'npc1', x: 115, y: 400 },
    { id: 'npc2', x: 265, y: 280 },
    { id: 'npc3', x: 425, y: 280 },
    { id: 'npc4', x: 585, y: 160 },
    { id: 'npc5', x: 265, y: 160 }
];

const conflictTemplates = {
    npc1: [
        {
            title: "Lucas (Triste por Exclusão)",
            text: "Lucas está isolado porque os colegas não o deixaram jogar futebol no recreio.",
            options: [
                { text: "Dizer: 'Futebol nem é tão legal. Vamos jogar outra coisa.'", correct: false, feedback: "Isso invalida o sentimento dele." },
                { text: "Dizer: 'Você está chateado porque gostaria de ter sido incluído no grupo?'", correct: true, feedback: "Correto! Identificou o sentimento e a necessidade (Inclusão)." },
                { text: "Ir brigar com os meninos que o excluíram.", correct: false, feedback: "Gera mais conflito em vez de conexão." }
            ]
        },
        {
            title: "Lucas (Excluído na Brincadeira)",
            text: "Lucas ficou olhando de longe enquanto os colegas escolhiam os times para brincar.",
            options: [
                { text: "Dizer: 'Você parece triste porque queria participar também.'", correct: true, feedback: "Perfeito! Você reconheceu a dor de exclusão." },
                { text: "Dizer: 'Não é nada, vai dar tudo certo.'", correct: false, feedback: "Isso diminui o problema em vez de acolher." },
                { text: "Fazer graça com ele na frente dos outros.", correct: false, feedback: "Isso aumenta a vergonha e o afastamento." }
            ]
        }
    ],
    npc2: [
        {
            title: "Mariana (Irritada com Apelido)",
            text: "Mariana bateu forte na mesa porque um colega a chamou por um apelido desagradável.",
            options: [
                { text: "Dizer: 'Não ligue para isso, Mariana, é só uma bobeira.'", correct: false, feedback: "Ignorar não resolve a quebra de respeito." },
                { text: "Dizer: 'Quando me chamam por esse nome, eu me sinto irritada porque preciso de respeito. Por favor, me chame pelo meu nome.'", correct: true, feedback: "Perfeito! Estrutura ideal da CNV (Observação, Sentimento, Necessidade e Pedido)." },
                { text: "Dar um apelido ruim de volta para o menino.", correct: false, feedback: "Aumenta o ciclo de agressões." }
            ]
        },
        {
            title: "Mariana (Humilhada na Aula)",
            text: "Mariana ficou bastante irritada depois de ser chamada de um nome ofensivo perto da turma.",
            options: [
                { text: "Dizer: 'Se você não gosta, então mude de assunto.'", correct: false, feedback: "Não trata a dor do respeito ferido." },
                { text: "Dizer: 'Eu fico incomodada quando sou tratada assim, porque preciso de respeito.'", correct: true, feedback: "Excelente! Você falou sobre sentimento e necessidade." },
                { text: "Responder com ofensa para a pessoa.", correct: false, feedback: "Isso só agrava a situação." }
            ]
        }
    ],
    npc3: [
        {
            title: "Carlos (Trabalho em Grupo)",
            text: "Carlos está gritando que vai fazer tudo sozinho porque ninguém o ajuda.",
            options: [
                { text: "Dizer: 'Eles são preguiçosos mesmo.'", correct: false, feedback: "Julgar os outros impede a cooperação." },
                { text: "Dizer: 'Você está sobrecarregado e precisa de apoio e divisão justa de tarefas?'", correct: true, feedback: "Correto! Focou no sentimento de sobrecarga e necessidade de apoio." },
                { text: "Dizer para ele deixar os outros com nota zero.", correct: false, feedback: "Isso pune e corta o diálogo em vez de resolver." }
            ]
        },
        {
            title: "Carlos (Sobrecarregado com a Tarefa)",
            text: "Carlos disse que não aguenta mais a quantidade de trabalho e quer fazer tudo sozinho.",
            options: [
                { text: "Dizer: 'Você está cansado e precisa de ajuda com a divisão das tarefas?'", correct: true, feedback: "Muito bem! Você identificou a necessidade de apoio." },
                { text: "Dizer: 'É só você se organizar melhor.'", correct: false, feedback: "Isso não resolve o sentimento de sobrecarga." },
                { text: "Mandar ele parar de reclamar.", correct: false, feedback: "Fecha a comunicação e aumenta a tensão." }
            ]
        }
    ],
    npc4: [
        {
            title: "Júlia (Esbarrão no Corredor)",
            text: "Derrubaram os livros da Júlia e ela acha que foi de propósito.",
            options: [
                { text: "Dizer: 'Calma, vamos ver se foi sem querer antes de julgar?'", correct: true, feedback: "Muito bem! Estimulou a observação neutra dos fatos." },
                { text: "Dizer para ela derrubar os livros da pessoa de volta.", correct: false, feedback: "Mais violência não ajuda." },
                { text: "Dizer que ela é muito desatenta.", correct: false, feedback: "Julgamento injusto." }
            ]
        },
        {
            title: "Júlia (Sentindo-se Acusada)",
            text: "Júlia ficou nervosa porque achou que a outra pessoa a culpou por algo que não fez.",
            options: [
                { text: "Dizer: 'Você se sentiu injustiçada e precisa de uma explicação clara?'", correct: true, feedback: "Ótimo! Você trouxe a percepção do sentimento e da necessidade." },
                { text: "Dizer: 'Você está exagerando mesmo.'", correct: false, feedback: "Isso não acolhe o que ela sente." },
                { text: "Ignorar o problema e seguir em frente.", correct: false, feedback: "Não resolve a tensão." }
            ]
        }
    ],
    npc5: [
        {
            title: "Pedro (Magoado com Figurinhas)",
            text: "Criaram uma figurinha do Pedro no WhatsApp para fazer piada.",
            options: [
                { text: "Dizer: 'Logo eles esquecem, Pedro.'", correct: false, feedback: "Minimiza o problema." },
                { text: "Dizer: 'Você se sente exposto porque precisa de segurança e respeito dos seus amigos?'", correct: true, feedback: "Exato! Validou a necessidade básica de proteção e acolhimento." },
                { text: "Mandar ele sair do grupo.", correct: false, feedback: "Isolamento não cura a mágoa." }
            ]
        },
        {
            title: "Pedro (Humilhado no Grupo)",
            text: "Pedro ficou envergonhado depois que fizeram uma brincadeira de mau gosto com ele.",
            options: [
                { text: "Dizer: 'Você sente vergonha e precisa de respeito e proteção.'", correct: true, feedback: "Certo! Você nomeou o sentimento e a necessidade." },
                { text: "Dizer: 'É só uma brincadeira, para de se importar.'", correct: false, feedback: "Isso banaliza o que ele sente." },
                { text: "Excluir Pedro de todas as conversas.", correct: false, feedback: "Esse caminho piora o conflito." }
            ]
        }
    ]
};

let conflictData = {};

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function buildRoundConflicts() {
    const roundConflicts = {};

    Object.keys(conflictTemplates).forEach((npcId) => {
        const pool = conflictTemplates[npcId];
        const chosenCase = pool[Math.floor(Math.random() * pool.length)];
        const correctText = chosenCase.options.find(option => option.correct)?.text;
        const shuffledOptions = shuffleArray(chosenCase.options).map(option => ({ ...option }));

        shuffledOptions.forEach((option) => {
            option.correct = option.text === correctText;
        });

        roundConflicts[npcId] = {
            title: chosenCase.title,
            text: chosenCase.text,
            options: shuffledOptions
        };
    });

    conflictData = roundConflicts;
}

function resetGameState() {
    resolvedNpcs.clear();
    solvedConflicts = 0;
    activeNpc = null;
    playerX = 720;
    playerY = 250;
    moveX = 0;
    moveY = 0;
    buildRoundConflicts();

    document.getElementById('solved-count').innerText = '0';
    npcs.forEach(npc => document.getElementById(npc.id).classList.remove('resolved'));
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('dialog-box').classList.add('hidden');
    document.getElementById('feedback-text').classList.add('hidden');
    document.getElementById('feedback-text').classList.remove('correct-feedback', 'wrong-feedback');
    document.getElementById('close-dialog-btn').classList.add('hidden');
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    checkProximity();
}

// LÓGICA DO ANALÓGICO (Corrigido para capturar dedo único em aparelhos móveis)
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;
let moveX = 0;
let moveY = 0;

function handleJoystickStart(e) {
    joystickActive = true;
    const touch = e.touches ? e.touches[0] : e;
    joystickStartX = touch.clientX;
    joystickStartY = touch.clientY;
}

function handleJoystickMove(e) {
    if (!joystickActive) return;
    const touch = e.touches ? e.touches[0] : e;
    
    let deltaX = touch.clientX - joystickStartX;
    let deltaY = touch.clientY - joystickStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = 25;

    if (distance > maxRadius) {
        deltaX = (deltaX / distance) * maxRadius;
        deltaY = (deltaY / distance) * maxRadius;
    }

    joystickStick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    moveX = deltaX / maxRadius;
    moveY = deltaY / maxRadius;
}

function handleJoystickEnd() {
    joystickActive = false;
    joystickStick.style.transform = 'translate(0px, 0px)';
    moveX = 0;
    moveY = 0;
}

joystickBase.addEventListener('mousedown', handleJoystickStart);
window.addEventListener('mousemove', handleJoystickMove);
window.addEventListener('mouseup', handleJoystickEnd);
joystickBase.addEventListener('touchstart', handleJoystickStart, { passive: true });
window.addEventListener('touchmove', handleJoystickMove, { passive: true });
joystickBase.addEventListener('touchend', handleJoystickEnd);

// FUNÇÃO DE BARREIRAS SÓLIDAS DAS MESAS
function checkCollision(x, y, width = playerWidth, height = playerHeight) {
    for (let desk of desks) {
        const collisionX = desk.x + deskCollisionInset;
        const collisionY = desk.y + deskCollisionInset;
        const collisionW = desk.w - deskCollisionInset * 2;
        const collisionH = desk.h - deskCollisionInset * 2;

        if (x < collisionX + collisionW &&
            x + width > collisionX &&
            y < collisionY + collisionH &&
            y + height > collisionY) {
            return true; 
        }
    }
    return false;
}

function tryMove(nextX, nextY) {
    const currentX = playerX;
    const currentY = playerY;

    const canMoveDiagonal = !checkCollision(nextX, nextY);
    const canMoveX = !checkCollision(nextX, currentY);
    const canMoveY = !checkCollision(currentX, nextY);

    if (canMoveDiagonal) {
        playerX = nextX;
        playerY = nextY;
        return true;
    }

    let moved = false;

    if (canMoveX && nextX >= 10 && nextX <= 810) {
        playerX = nextX;
        moved = true;
    }

    if (canMoveY && nextY >= 70 && nextY <= 500) {
        playerY = nextY;
        moved = true;
    }

    return moved;
}

function gameLoop() {
    if (document.getElementById('dialog-box').classList.contains('hidden')) {
        const nextX = playerX + moveX * playerSpeed;
        const nextY = playerY + moveY * playerSpeed;

        tryMove(nextX, nextY);

        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
        player.classList.toggle('walking', moveX !== 0 || moveY !== 0);
        checkProximity();
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (!document.getElementById('dialog-box').classList.contains('hidden')) return;
    if (e.key === 'ArrowUp') moveY = -1;
    if (e.key === 'ArrowDown') moveY = 1;
    if (e.key === 'ArrowLeft') moveX = -1;
    if (e.key === 'ArrowRight') moveX = 1;
    if ((e.key === 'e' || e.key === 'E') && activeNpc) {
        openDialog(activeNpc);
    }
});
window.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) moveY = 0;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) moveX = 0;
});

// PROXIMIDADE E ACIONAMENTO AUTOMÁTICO DE BALÕES
function checkProximity() {
    let nearAnyNpc = false;
    activeNpc = null;

    npcs.forEach(npc => {
        const dx = playerX - npc.x;
        const dy = playerY - npc.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const npcElement = document.getElementById(npc.id);
        const bubble = npcElement ? npcElement.querySelector('.speech-bubble') : null;

        if (distance < 50 && !resolvedNpcs.has(npc.id)) {
            nearAnyNpc = true;
            activeNpc = npc.id;
            if (bubble) bubble.classList.remove('hidden');
        } else {
            if (bubble) bubble.classList.add('hidden');
        }
    });

    document.getElementById('interaction-prompt').style.display = nearAnyNpc ? 'block' : 'none';
}

// ✅ CORREÇÃO DO CLIQUE: O prompt agora abre o diálogo perfeitamente ao toque/clique em qualquer tela
document.getElementById('interaction-prompt').onclick = () => {
    if (activeNpc && !resolvedNpcs.has(activeNpc)) {
        openDialog(activeNpc);
    }
};

function openDialog(npcId) {
    const data = conflictData[npcId];
    
    // Oculta o balão de fala ao abrir o menu principal
    const currentNpc = document.getElementById(npcId);
    if(currentNpc) {
        const b = currentNpc.querySelector('.speech-bubble');
        if(b) b.classList.add('hidden');
    }

    document.getElementById('dialog-title').innerText = data.title;
    document.getElementById('dialog-text').innerText = data.text;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    data.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option.text;
        btn.onclick = () => makeChoice(option, npcId);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('dialog-box').classList.remove('hidden');
    document.getElementById('feedback-text').classList.add('hidden');
    document.getElementById('close-dialog-btn').classList.add('hidden');
}

function makeChoice(option, npcId) {
    const feedback = document.getElementById('feedback-text');
    feedback.innerText = option.feedback;
    feedback.classList.remove('hidden');
    feedback.classList.remove('correct-feedback', 'wrong-feedback');
    feedback.classList.add(option.correct ? 'correct-feedback' : 'wrong-feedback');

    if (option.correct) {
        resolvedNpcs.add(npcId);
        document.getElementById(npcId).classList.add('resolved');
        document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        document.getElementById('close-dialog-btn').classList.remove('hidden');
    }
}

document.getElementById('close-dialog-btn').onclick = () => {
    document.getElementById('dialog-box').classList.add('hidden');
    solvedConflicts = resolvedNpcs.size;
    document.getElementById('solved-count').innerText = solvedConflicts;

    if (solvedConflicts === 5) {
        document.getElementById('win-screen').classList.remove('hidden');
    }

    checkProximity();
};

document.getElementById('restart-btn').onclick = () => {
    resetGameState();
};




// Inicializa o loop principal de renderização/movimento
resetGameState();
requestAnimationFrame(gameLoop)