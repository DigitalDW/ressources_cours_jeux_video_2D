const Breakout = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function Breakout(){
        Phaser.Scene.call(this, { key: 'breakout' })

        this.briques;
        this.palet;
        this.balle;
        this.manette;
        this.vies = 3;
        this.score = 0;
        this.texteScore;
    },

    preload: function(){
        this.load.atlas('assets', 'assets/images/breakout.png', 'assets/images/breakout.json');

        this.load.audio('rebond', 'assets/sons/rebond.mp3');
        this.load.audio('casse', 'assets/sons/casse.mp3');
        this.load.audio('gameOver', 'assets/sons/gameOver.mp3');
        this.load.audio('viePerdue', 'assets/sons/viePerdue.m4a');
    },

    create: function(){
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.briques = this.physics.add.staticGroup({
            key: 'assets',
            frame: ['bleu', 'rouge', 'jaune', 'vert', 'gris', 'violet'],
            frameQuantity: 10,
            gridAlign: {
                width: 10,
                height: 6,
                cellWidth: 64,
                cellHeight: 32,
                x: 112,
                y:100
            }
        });

        this.balle = this.physics.add.image(400, 500, 'assets', 'balle').setCollideWorldBounds(true).setBounce(1);
        this.balle.setData('surLePalet', true);

        this.palet = this.physics.add.image(400, 550, 'assets', 'palet').setImmovable();

        // Collisions
        this.physics.add.collider(this.balle, this.briques, this.contactBrique, null, this);
        this.physics.add.collider(this.balle, this.palet, this.contactPalet, null, this);

        // Score et vies
        this.texteScore = this.add.text(10, 10, `SCORE : ${this.score}`, { font: '16px Courier'});
        this.texteVies = this.add.text(700, 10, `VIES : ${this.vies}`, { font: '16px Courier'});
    
        // Gamepad
        this.input.gamepad.once('down', (pad, button, index) => {
            this.manette = pad;
        }, this);
    },

    contactBrique: function(balle, brique){
        brique.disableBody(true, true);
        this.score += 10;
        this.texteScore.setText(`SCORE : ${this.score}`);
        this.sound.play('casse');
    },

    contactPalet: function(balle, palet){
        this.sound.play('rebond');
        let difference = 0;

        if(balle.x < palet.x)
        {
            difference = palet.x - balle.x;
            balle.setVelocityX(-10 * difference);
        }
        else if (balle.x > palet.x)
        {
            difference = balle.x - palet.x;
            balle.setVelocityX(10 * difference);
        }
        else
        {
            balle.setVelocityX(2 + Math.random() * 8);
        }
    },

    reinitialiserBalle: function(){
        this.balle.setVelocity(0);
        this.balle.setPosition(this.palet.x, 500);
        this.balle.setData('surLePalet', true);
    },

    reinitialiserNiveau: function(){
        this.reinitialiserBalle();

        this.briques.children.each(function(brick){
            brick.enableBody(false, 0, 0, true, true);
        });

        this.score = 0;
        this.vies = 3;
        this.texteScore.setText(`SCORE : ${this.score}`);
        this.texteVies.setText(`VIES : ${this.vies}`);
    },

    update: function(){
        if(this.balle.y > 600)
        {
            this.vies--;
            if(this.vies == 0){
                this.sound.play('gameOver');
                this.reinitialiserNiveau();
            }
            else{
                this.reinitialiserBalle();
                this.sound.play('viePerdue');
                this.texteVies.setText(`VIES : ${this.vies}`);
            }
        }
        // Gestion du gamepad
        if (this.manette)
        {
            if(this.manette.left)
            {
                this.palet.x = Phaser.Math.Clamp(this.palet.x - 8, 52, 748);
                if (this.balle.getData('surLePalet'))
                {
                    this.balle.x = this.palet.x;
                }
            }
            else if (this.manette.right)
            {
                this.palet.x = Phaser.Math.Clamp(this.palet.x + 8, 52, 748);
                if (this.balle.getData('surLePalet'))
                {
                    this.balle.x = this.palet.x;
                }
            }
            else if (this.manette.A)
            {
                if (this.balle.getData('surLePalet'))
                {
                    this.balle.setVelocity(-75, -300);
                    this.balle.setData('surLePalet', false);
                }
            }
        }
    },

})

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    input: {
        gamepad: true,
    },
    scene: [Breakout],
    physics: {
        default: 'arcade',
    }
};

const jeu = new Phaser.Game(config);