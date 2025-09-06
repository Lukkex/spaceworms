import './App.css';
import { createSignal, onCleanup, createEffect } from 'solid-js';
import { listen } from '@tauri-apps/api/event';

const images = import.meta.glob('./assets/worms/*.png', { eager: true });

function App() {
	let wormRef: HTMLDivElement;

	type Position = {
		x: number;
		y: number;
	};

	const homePosition = { x: 0, y: 0 };

	const [position, setPosition] = createSignal(homePosition);
	const [direction, setDirection] = createSignal(0);
	const [frame, setFrame] = createSignal(1);

	const incrementNumber = () => setFrame((prev) => (prev % 4) + 1);

	createEffect(() => {
		const interval = setInterval(incrementNumber, 50);

		onCleanup(() => clearInterval(interval));
	});

	listen<Position>('mouse_click', (event) => {
		if (sendHome(event.payload)) return;

		calculateDirection(position(), event.payload);
		setPosition(event.payload);
	});

	const sendHome = (clickPosition: Position) => {
		if (!wormRef) return false;

		const boundingBox = wormRef.getBoundingClientRect();
		if (!boundingBoxIsClicked(boundingBox, clickPosition)) return false;

		calculateDirection(position(), homePosition);
		setPosition(homePosition);
		return true;
	};

	const boundingBoxIsClicked = (boundingBox: DOMRect, clickPosition: Position) => {
		const { x, y } = clickPosition;

		return (
			x > boundingBox.left && x < boundingBox.right && y > boundingBox.top && y < boundingBox.bottom
		);
	};

	const calculateDirection = (oldPosition: Position, newPosition: Position) => {
		const x = oldPosition.x - newPosition.x;
		const y = oldPosition.y - newPosition.y;
		let angle = (Math.atan2(y, x) * 180) / Math.PI;

		if (angle < 0) angle = 360 + angle;

		const roundToNearest15 = Math.round(angle / 15) * 15;
		roundToNearest15 === 360 ? 0 : roundToNearest15;
		setDirection(roundToNearest15);
	};

	const calculateStyle = (position: Position) => {
		return `position: absolute; left: ${position.x - 50}px; top: ${position.y - 80}px; 
    animation-timing-function: ease-in-out;
    transition: top 1.5s, left 1.5s, transform 0.5s;
  `;
	};

	return (
		<div class="container">
			<div style={calculateStyle(position())} ref={wormRef}>
				<img
					class="worm"
					width={175}
					src={
						images[
							`./assets/worms/SpaceWormGreen${frame().toString().padStart(1, '0')}.png`
						].default
					}
				/>
			</div>
		</div>
	);
}

export default App;