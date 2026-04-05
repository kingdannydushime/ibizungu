import 'phaser';
import { MainMenu } from './game/scenes/MainMenu';
import { GameScene } from './game/scenes/GameScene';
import { ShopScene } from './game/scenes/ShopScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenu, GameScene, ShopScene]
};

window.onload = () => {
    new Phaser.Game(config);
};
