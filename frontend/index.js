import { backend } from "declarations/backend";

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.score = 0;
        this.lives = 3;
        
        // Player properties
        this.player = {
            x: 50,
            y: 450,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            isJumping: false
        };
        
        // Platform properties
        this.platforms = [
            { x: 0, y: 500, width: 800, height: 100 },
            { x: 300, y: 400, width: 200, height: 20 },
            { x: 100, y: 300, width: 200, height: 20 },
            { x: 500, y: 200, width: 200, height: 20 }
        ];
        
        // Enemy properties
        this.enemies = [
            { x: 300, y: 370, width: 32, height: 32, direction: 1 }
        ];
        
        // Game state
        this.gameOver = false;
        
        // Input handling
        this.keys = {};
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Initialize UI elements
        this.initializeUI();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeUI() {
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.gameOverScreen = document.getElementById('gameOver');
        this.submitScoreBtn = document.getElementById('submitScore');
        this.restartGameBtn = document.getElementById('restartGame');
        
        this.submitScoreBtn.addEventListener('click', this.submitScore.bind(this));
        this.restartGameBtn.addEventListener('click', this.restartGame.bind(this));
        
        // Initialize Feather icons
        feather.replace();
    }
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    
    update() {
        if (this.gameOver) return;
        
        // Player movement
        if (this.keys['ArrowLeft']) {
            this.player.velocityX = -5;
        } else if (this.keys['ArrowRight']) {
            this.player.velocityX = 5;
        } else {
            this.player.velocityX = 0;
        }
        
        // Jumping
        if (this.keys[' '] && !this.player.isJumping) {
            this.player.velocityY = -15;
            this.player.isJumping = true;
        }
        
        // Apply gravity
        this.player.velocityY += 0.8;
        
        // Update player position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;
        
        // Platform collision
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isJumping = false;
                }
            }
        });
        
        // Enemy movement and collision
        this.enemies.forEach(enemy => {
            enemy.x += enemy.direction * 2;
            if (enemy.x <= 300 || enemy.x >= 500) {
                enemy.direction *= -1;
            }
            
            if (this.checkCollision(this.player, enemy)) {
                this.lives--;
                this.livesDisplay.textContent = this.lives;
                this.player.x = 50;
                this.player.y = 450;
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.gameOverScreen.classList.remove('hidden');
                }
            }
        });
        
        // Keep player in bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width - this.player.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.ctx.fillStyle = '#4CAF50';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw player
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw enemies
        this.ctx.fillStyle = '#0000FF';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    async submitScore() {
        const playerName = document.getElementById('playerName').value;
        if (!playerName) return;
        
        const loading = document.querySelector('.loading');
        loading.classList.remove('hidden');
        
        try {
            await backend.submitScore(playerName, this.score);
        } catch (error) {
            console.error('Error submitting score:', error);
        } finally {
            loading.classList.add('hidden');
        }
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.player.x = 50;
        this.player.y = 450;
        this.gameOver = false;
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = this.lives;
        this.gameOverScreen.classList.add('hidden');
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
