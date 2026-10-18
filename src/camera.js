import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { apertureOptions } from './optics.js';

// Reference-informed geometry. Engraving spacing and focus throw are teaching scales,
// not measured dimensions or a claim about any particular lens generation.
const SHUTTER_MARKS = ['A', '2000', '1000', '500', '250', '125', '60', '30', '15', '8', '4', '2', '1', '2s', '4s', '8s', 'B', 'T', 'X'];
const focusAngle = m => -2.1 + 4.2 * Math.log(Math.max(1, Math.min(2000, m))) / Math.log(2000);
const apertureAngle = (n, max) => -.95 + Math.log2(n / max) * .64;

export function createCameraViewer(host, onPart) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dce2dc');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Detailed F3 teaching model. Drag to orbit. Use Show on camera buttons to inspect the shutter dial, aperture ring, or focus ring.');

  const camera = new THREE.PerspectiveCamera(36, 1, .05, 100);
  camera.position.set(-3.6, 2.7, 5.8);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .20, .7);
  controls.minDistance = 1.15;
  controls.maxDistance = 18;
  controls.enablePan = false;
  controls.enableDamping = false;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04).texture;
  scene.environment = environment;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x758475, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(-3, 5, 4); scene.add(key);

  function texture(draw, width = 1024, height = 256) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return result;
  }
  let seed = 341;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const leatherMap = texture((c, w, h) => {
    c.fillStyle = '#343434'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 12000; i++) {
      const x = random() * w, y = random() * h, radius = .7 + random() * 2;
      c.fillStyle = `rgb(${60 + Math.floor(random() * 90)} ${60 + Math.floor(random() * 40)} ${60 + Math.floor(random() * 40)})`;
      c.beginPath(); c.ellipse(x, y, radius, radius * .65, random() * 3, 0, Math.PI * 2); c.fill();
    }
  }, 512, 512);
  leatherMap.wrapS = leatherMap.wrapT = THREE.RepeatWrapping;
  leatherMap.repeat.set(3, 2);
  const black = new THREE.MeshStandardMaterial({ color: 0x141817, roughness: .40, metalness: .65 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x262a29, roughness: .32, metalness: .8 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x171a19, roughness: .9, bumpMap: leatherMap, bumpScale: .028 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xb5bab7, roughness: .23, metalness: .95 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0d1110, roughness: .78 });
  const red = new THREE.MeshStandardMaterial({ color: 0x9c3630, roughness: .5 });
  const white = new THREE.MeshBasicMaterial({ color: 0xe9e7db });
  const accent = new THREE.MeshBasicMaterial({ color: 0x2f967a, transparent: true, opacity: .85, depthTest: false });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x304d44, roughness: .035, metalness: .45, clearcoat: 1, transparent: true, opacity: .45, side: THREE.DoubleSide });
  const cutawayMaterial = new THREE.MeshStandardMaterial({ color: 0x78998d, transparent: true, opacity: .10, depthWrite: false, side: THREE.DoubleSide, roughness: .5 });
  const root = new THREE.Group(); scene.add(root);
  const shell = new THREE.Group(), finder = new THREE.Group(), back = new THREE.Group(), lens = new THREE.Group(), inner = new THREE.Group();
  root.add(shell, finder, back, lens, inner);
  const dynamicMaterials = new Set();
  function box(parent, w, h, d, x, y, z, mat = black, round = .025) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(round, w / 3, h / 3, d / 3)), mat);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function cylinder(parent, r, length, x, y, z, mat = black, axis = 'z') {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, length, 80), mat);
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function ring(parent, r, thickness, x, y, z, mat = chrome) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, thickness, 10, 96), mat);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function text(parent, value, x, y, z, w, h, color = '#ebe9dd', outlined = false) {
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = '600 160px Arial';
    const textWidth = Math.ceil(measure.measureText(value).width + 36);
    const map = texture(c => {
      c.font = '600 160px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (outlined) { c.lineWidth = 5; c.strokeStyle = color; c.strokeText(value, textWidth / 2, 128); }
      else { c.fillStyle = color; c.fillText(value, textWidth / 2, 128); }
    }, textWidth, 256);
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
    dynamicMaterials.add(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function markPart(group, part) { group.traverse(o => { o.userData.part = part; }); }
  function screw(parent, x, y, z) {
    cylinder(parent, .045, .015, x, y, z, chrome);
    box(parent, .055, .009, .004, x, y, z + .009, rubber, .001);
    box(parent, .009, .055, .004, x, y, z + .010, rubber, .001);
  }
  function ribbedRing(parent, r, z, width, count = 72) {
    cylinder(parent, r, width, 0, 0, z, rubber);
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const rib = box(parent, .025, .035, width * .92, Math.sin(a) * (r + .005), Math.cos(a) * (r + .005), z, edge, .006);
      rib.rotation.z = -a;
    }
  }
  function barrelText(parent, value, r, z, angle, width = .22, color) {
    const label = text(parent, value, Math.sin(angle) * r, Math.cos(angle) * r, z, width, .105, color);
    label.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
      new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0),
      new THREE.Vector3(0, 0, -1), new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0)
    ));
    return label;
  }
  function topFace(parent, r, y, draw) {
    const map = texture(draw, 1024, 1024);
    const mat = new THREE.MeshStandardMaterial({ map, roughness: .55, metalness: .25 }); dynamicMaterials.add(mat);
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 96), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; parent.add(mesh); return mesh;
  }
  function circularScale(c, w, h, labels) {
    c.fillStyle = '#171b1a'; c.fillRect(0, 0, w, h);
    labels.forEach((value, i) => {
      const a = i / labels.length * Math.PI * 2;
      c.save(); c.translate(w / 2 + Math.sin(a) * 365, h / 2 + Math.cos(a) * 365); c.rotate(-a);
      c.fillStyle = value === 'A' ? '#86c481' : value === '60' ? '#e16a68' : value.includes('s') ? '#d3a36a' : '#ecebe4';
      c.font = '600 68px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(value, 0, 0); c.restore();
    });
  }

  // Body: contoured grip, separate leather panels, seams, screws and red F3 stripe.
  box(shell, 3.55, 1.85, 1.14, 0, -.05, 0, black, .12);
  box(shell, 3.57, .30, 1.17, 0, .96, 0, black, .07);
  box(shell, 3.53, .16, 1.16, 0, -1, 0, edge, .05);
  box(shell, 1.30, 1.37, .045, -1.03, -.12, .591, leather, .04);
  box(shell, 1.18, 1.37, .045, 1.10, -.12, .591, leather, .04);
  box(shell, .43, 1.45, .26, -1.55, -.12, .60, black, .12);
  box(shell, .035, 1.35, .03, -1.30, -.12, .739, red, .006);
  box(shell, .045, 1.33, .88, -1.78, -.10, -.01, leather);
  box(shell, .045, 1.33, .88, 1.78, -.10, -.01, leather);
  box(shell, 1.44, 1.58, .09, 0, -.08, .61, black, .10);
  text(shell, 'F3', -1.04, .97, .60, .34, .19, '#e2e1d7', true);
  for (const x of [-1.73, 1.73]) {
    cylinder(shell, .10, .05, x, .66, .62, chrome);
    ring(shell, .075, .020, x, .66, .66, chrome);
    // Rounded triangular strap rings hang from circular mounting eyelets.
    const points = [[-.10,.05],[.10,.05],[.16,-.17],[.12,-.21],[-.12,-.21],[-.16,-.17]].map(([a,b])=>new THREE.Vector3(a,b,0));
    const curve = new THREE.CatmullRomCurve3(points,true,'centripetal');
    const lug = new THREE.Mesh(new THREE.TubeGeometry(curve,64,.018,10,true),chrome);
    lug.position.set(x,.62,.73); lug.rotation.y=x<0?-.3:.3; shell.add(lug);
    screw(shell, x, -.88, .59);
  }
  box(shell, .22, .27, .10, -1.10, .43, .67, rubber);
  box(shell, .14, .08, .015, -1.10, .43, .73, edge);
  cylinder(shell, .145, .10, -.77, .34, .73, rubber);
  const previewButton = cylinder(shell, .105, .04, -.77, .34, .80, chrome); previewButton.userData.part = 'aperture';
  cylinder(shell, .115, .06, -.78, -.54, .72, rubber);
  cylinder(shell, .14, .08, .80, .0, .74, black);
  cylinder(shell, .10, .035, .80, .0, .79, chrome);
  cylinder(shell, .11, .04, 1.31, .69, .62, chrome);
  cylinder(shell, .07, .045, 1.31, .69, .65, rubber);
  screw(shell, .0, -.83, .68);
  ring(shell, .685, .045, 0, 0, .73, chrome);
  ring(shell, .625, .025, 0, 0, .76, black);
  for (let a = 0; a < 6; a++) screw(shell, Math.sin(a * Math.PI / 3) * .655, Math.cos(a * Math.PI / 3) * .655, .77);

  box(back, 3.40, 1.55, .12, 0, -.1, -.63, leather, .07);
  box(back, 1.10, .72, .06, 0, -.1, -.72, black);
  const memo = text(back, 'FILM', 0, -.1, -.76, .65, .16); memo.rotation.y = Math.PI;
  // Broad trapezoidal finder, sloped face, foot seam and eyepiece.
  const prismShape = new THREE.Shape();
  prismShape.moveTo(-.69, 0); prismShape.lineTo(-.56, .52); prismShape.lineTo(-.44, .68);
  prismShape.lineTo(.44, .68); prismShape.lineTo(.56, .52); prismShape.lineTo(.69, 0); prismShape.closePath();
  const prism = new THREE.Mesh(new THREE.ExtrudeGeometry(prismShape, { depth: .96, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, steps: 1 }), black);
  prism.position.set(0, 1.05, -.50); finder.add(prism);
  box(finder, 1.43, .13, 1.04, 0, 1.06, 0, edge);
  text(finder, 'Nikon', 0, 1.30, .495, 1.13, .30);
  text(finder, 'HP', .53, 1.11, .54, .15, .09);
  cylinder(finder, .285, .14, 0, 1.30, -.62, rubber);
  ring(finder, .253, .018, 0, 1.30, -.705, chrome);
  ring(finder, .223, .022, 0, 1.30, -.716, black);
  box(finder, .32, .23, .014, 0, 1.30, -.706, glass, .004);
  // Four dark borders retain the rectangular optical window inside the round eyepiece.
  for(const x of [-.173,.173]) box(finder,.025,.26,.018,x,1.30,-.72,black,.002);
  for(const y of [1.172,1.428]) box(finder,.37,.025,.018,0,y,-.72,black,.002);
  box(finder, .35, .12, .04, 0, 1.00, .57, edge);

  // Shutter speed dial is on the photographer's right (left in a front view).
  const shutterDial = new THREE.Group(); shutterDial.position.set(-1.03, 1.15, -.13); shell.add(shutterDial);
  cylinder(shutterDial, .365, .20, 0, .10, 0, black, 'y');
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * Math.PI * 2;
    const rib = box(shutterDial, .025, .17, .027, Math.sin(a) * .365, .10, Math.cos(a) * .365, edge, .003); rib.rotation.y = a;
  }
  topFace(shutterDial, .35, .205, (c, w, h) => circularScale(c, w, h, SHUTTER_MARKS));
  cylinder(shutterDial, .072, .055, 0, .23, 0, chrome, 'y'); markPart(shutterDial, 'shutter');
  const shutterIndex = box(shell, .023, .018, .10, -1.03, 1.13, .30, white, .003);
  cylinder(shell, .30, .13, -1.48, 1.15, .29, black, 'y');
  cylinder(shell, .12, .07, -1.48, 1.25, .29, chrome, 'y');
  cylinder(shell, .045, .018, -1.48, 1.295, .29, rubber, 'y');
  const advance = box(shell, .59, .06, .13, -1.48, 1.17, -.40, black); advance.rotation.y = -.3;
  const rewind = new THREE.Group(); rewind.position.set(1.18, 1.12, -.05); shell.add(rewind);
  cylinder(rewind, .37, .12, 0, .04, 0, black, 'y');
  topFace(rewind, .365, .108, (c, w, h) => circularScale(c, w, h, ['0', '+1', '+2', '', '400', '800', '', '−2', '−1']));
  cylinder(rewind, .255, .22, 0, .17, 0, black, 'y');
  cylinder(rewind, .23, .035, 0, .30, 0, edge, 'y');
  box(rewind, .35, .025, .07, 0, .33, 0, chrome);
  const planeMark = text(shell, 'Φ', 1.22, 1.12, .40, .18, .13); planeMark.rotation.x = -Math.PI / 2;

  // Interior mechanics remain intentionally schematic.
  const mechanics = new THREE.Group(); inner.add(mechanics);
  for (const x of [-1.28,1.28]) {
    cylinder(mechanics,.24,1.40,x,-.08,-.22,black,'y');
    for(const y of [-.80,.65]) cylinder(mechanics,.30,.055,x,y,-.22,edge,'y');
    cylinder(mechanics,.075,.16,x,.76,-.22,chrome,'y');
  }
  for(const y of [-.73,.73]) box(mechanics,2.05,.055,.12,0,y,-.43,chrome,.008);
  for(const x of [-.98,.98]) box(mechanics,.065,1.48,.12,x,0,-.43,edge,.008);
  box(back,1.95,1.28,.035,0,-.08,-.55,edge,.025);
  const brass = new THREE.MeshStandardMaterial({color:0xb89b59,metalness:.75,roughness:.4});
  for(const x of [-1.25,1.25]) {
    box(mechanics,.69,.045,.73,x,.84,-.04,edge);
    for(const y of [.90,.97,1.04]) cylinder(mechanics,.21,.035,x,y,-.04,brass,'y');
    cylinder(mechanics,.065,.16,x,1.13,-.04,chrome,'y');
  }
  // A continuous 35mm strip: flat at the gate, curling around both spool axes.
  // Perforations are actual openings, so they remain visible from either side.
  const perforations = [];
  for(let x=-1.94;x<1.99;x+=.215) perforations.push([x-.047,x+.047]);
  const columns = [-2.05,2.05,-1.28,1.28];
  for(let x=-2.05;x<2.05;x+=.025) columns.push(x);
  perforations.forEach(pair=>columns.push(...pair)); columns.sort((a,b)=>a-b);
  const rows=[-.84,-.753,-.687,.687,.753,.84], vertices=[], indices=[];
  const addVertex=(x,y)=>{const distance=Math.max(0,Math.abs(x)-1.28),angle=distance/.26;vertices.push(distance?Math.sign(x)*(1.28+.26*Math.sin(angle)):x,y,distance?.26*(1-Math.cos(angle)):0);};
  for(let i=0;i<columns.length-1;i++) for(let j=0;j<rows.length-1;j++) {
    const left=columns[i],right=columns[i+1],mid=(left+right)/2;
    if(right-left<.000001 || ((j===1||j===3)&&perforations.some(([a,b])=>mid>a&&mid<b)))continue;
    const offset=vertices.length/3;
    addVertex(left,rows[j]);addVertex(right,rows[j]);addVertex(right,rows[j+1]);addVertex(left,rows[j+1]);
    indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
  }
  const filmGeometry=new THREE.BufferGeometry();
  filmGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));filmGeometry.setIndex(indices);filmGeometry.computeVertexNormals();
  const film = new THREE.Mesh(filmGeometry, new THREE.MeshStandardMaterial({ color: 0x754529, roughness: .42, metalness:.08, side: THREE.DoubleSide }));
  film.position.z = -.48; film.userData.part = 'film'; inner.add(film);
  const shutter = new THREE.Group(); inner.add(shutter);
  box(shutter, 1.7, 1.18, .045, 0, 0, -.32);
  // Horizontal-travel curtain illustration rather than vertical metal blade slats.
  for (let x = -.8; x < .85; x += .08) box(shutter, .008, 1.13, .005, x, 0, -.29, edge, .001);
  markPart(shutter, 'shutter');
  const pivot = new THREE.Group(); pivot.position.set(0, .55, .10); inner.add(pivot);
  const mirror = box(pivot, 1.18, 1.10, .025, 0, -.55, 0, chrome); mirror.userData.part = 'mirror';
  const focusingScreen = box(inner, 1.25, .035, .95, 0, .80, 0, glass); focusingScreen.userData.part = 'finder';
  let focusRing, apertureRing, iris, opticsGroup, barrel, lensSpec;
  let barrelFull, barrelSection;
  let mode = 'assembled', phase = 'compose', activePart = null, lightPath;
  let animation = 0, disposed = false, currentState;
  let targets = { shutter: 0, aperture: 0, focus: 0 };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const halo = ring(root, .42, .014, 0, 0, 0, accent); halo.renderOrder = 10; halo.visible = false;
  const callout = document.createElement('div'); callout.className = 'camera-callout'; callout.hidden = true; callout.setAttribute('aria-live', 'polite'); host.append(callout);

  function disposeLens() {
    lens.traverse(o => {
      o.geometry?.dispose();
      if (dynamicMaterials.has(o.material)) { o.material.map?.dispose(); o.material.dispose(); dynamicMaterials.delete(o.material); }
    });
    barrelFull?.dispose(); barrelSection?.dispose();
    lens.clear(); iris = null; apertureRing = null;
  }
  function buildLens(spec) {
    disposeLens(); lensSpec = spec;
    const length = spec.length + .42, radius = spec.id === 500 ? .79 : spec.id === 300 ? .65 : .62;
    const start = .79, end = start + length;
    barrel = cylinder(lens, radius * .94, length, 0, 0, start + length / 2, black);
    barrelFull = barrel.geometry;
    barrelSection = new THREE.CylinderGeometry(radius * .94,radius * .94,length,80,1,true,Math.PI/2,Math.PI); 
    ring(lens, radius * .97, .025, 0, 0, start + .03, chrome);
    // Fixed index stays on the barrel; the numbered rings move underneath it.
    box(lens, .025, .018, .35, 0, radius + .025, start + .35, white, .002);
    for (const x of [-.16, -.10, .10, .16]) box(lens, .009, .014, .10, x, Math.sqrt(radius * radius - x * x) + .025, start + .37, white, .002);
    if (spec.id !== 500) {
      apertureRing = new THREE.Group(); lens.add(apertureRing);
      ribbedRing(apertureRing, radius, start + .12, .17);
      for (const n of apertureOptions(spec)) barrelText(apertureRing, String(n), radius + .031, start + .20, apertureAngle(n, spec.max), .18, n === spec.min ? '#dfab6c' : '#efeee1');
      markPart(apertureRing, 'aperture');
      // AI coupling ears sit near the lens mount.
      box(lens, .34, .12, .035, 0, radius + .06, start + .04, chrome);
      for (const x of [-.14, .14]) box(lens, .06, .16, .035, x, radius + .15, start + .04, chrome);
    } else {
      barrelText(lens, 'f/8 fixed', radius + .015, start + .18, 0, .40, '#efeee1');
    }
    const focusZ = start + length * .58, focusWidth = Math.max(.28, length * .36);
    focusRing = new THREE.Group(); lens.add(focusRing);
    ribbedRing(focusRing, radius + .012, focusZ, focusWidth);
    // Additional transverse grooves make the rubber grip read as a real textured ring.
    for (let z = focusZ - focusWidth / 2; z < focusZ + focusWidth / 2; z += .075) ring(focusRing, radius + .030, .009, 0, 0, z, rubber);
    const scaleZ = focusZ - focusWidth / 2 - .07;
    cylinder(focusRing, radius + .012, .15, 0, 0, scaleZ, black);
    for (const m of [1, 2, 3, 5, 10, 20, 50, 100, 500, 2000]) barrelText(focusRing, String(m), radius + .028, scaleZ, focusAngle(m), m >= 100 ? .28 : .20);
    barrelText(focusRing, 'm', radius + .028, scaleZ, -2.4, .12, '#d4c98b');
    box(focusRing, .035, .025, focusWidth * .8, 0, radius + .05, focusZ, new THREE.MeshStandardMaterial({ color: 0x9b8d54 }), .004);
    markPart(focusRing, 'focus');
    box(lens, .020, .025, .10, 0, radius + .035, scaleZ - .13, red, .003);
    ring(lens, radius + .005, .018, 0, 0, end - .07, edge);
    ring(lens, radius, .022, 0, 0, end, black);
    for (let r = radius * .77; r < radius; r += .026) ring(lens, r, .006, 0, 0, end + .023, edge);
    const title = spec.id === 500 ? 'REFLEX-NIKKOR 500mm 1:8' : `NIKKOR ${spec.id}mm 1:${spec.max}`;
    const frontMap = texture((c, w, h) => {
      c.clearRect(0, 0, w, h); c.fillStyle = '#ecece0'; c.font = '500 40px Arial'; c.textAlign = 'center';
      [...title].forEach((letter, i) => { const a = -.99 + i / (title.length - 1) * 1.98; c.save(); c.translate(w / 2, h / 2); c.rotate(a); c.fillText(letter, 0, -w * .444); c.restore(); });
      c.save(); c.translate(w / 2, h / 2); c.rotate(Math.PI); c.font = '600 46px Arial'; c.fillText('Nikon', 0, -w * .444); c.restore();
    }, 1024, 1024);
    const frontMat = new THREE.MeshBasicMaterial({ map: frontMap, transparent: true, depthWrite: false }); dynamicMaterials.add(frontMat);
    const engravings = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), frontMat); engravings.position.z = end + .035; lens.add(engravings);
    const coating = texture((c, w, h) => {
      const grad = c.createRadialGradient(w * .36, h * .31, 10, w / 2, h / 2, w * .5);
      grad.addColorStop(0, '#536054'); grad.addColorStop(.25, '#293b36'); grad.addColorStop(.62, '#112521'); grad.addColorStop(1, '#040b0b');
      c.fillStyle = grad; c.fillRect(0, 0, w, h);
      c.globalAlpha = .23; c.fillStyle = '#e3ba7d'; c.beginPath(); c.ellipse(w * .62, h * .40, w * .15, h * .30, -.55, 0, 7); c.fill();
      c.fillStyle = '#758bcb'; c.beginPath(); c.ellipse(w * .28, h * .25, w * .20, h * .12, -.6, 0, 7); c.fill();
    }, 512, 512);
    const coatMat = new THREE.MeshPhysicalMaterial({ map: coating, roughness: .08, metalness: .25, clearcoat: 1, transparent: true, opacity: .70 }); dynamicMaterials.add(coatMat);
    const frontGlass = new THREE.Mesh(new THREE.SphereGeometry(radius * .76, 64, 32), coatMat);
    frontGlass.scale.z = .10; frontGlass.position.z = end + .005; lens.add(frontGlass);
    opticsGroup = new THREE.Group(); lens.add(opticsGroup);
    for (const f of [.30, .62, .78]) cylinder(opticsGroup, radius * .70, .035, 0, 0, start + length * f, glass);
    if (spec.id === 500) {
      cylinder(opticsGroup, .23, .035, 0, 0, end + .09, black);
      ring(opticsGroup, .23, .012, 0, 0, end + .11, edge);
    } else {
      const irisMat = new THREE.MeshStandardMaterial({ color: 0x4e5149, side: THREE.DoubleSide, metalness: .7, roughness: .45 }); dynamicMaterials.add(irisMat);
      iris = new THREE.Mesh(new THREE.RingGeometry(.20, radius * .72, 9), irisMat); iris.position.z = end - .10; lens.add(iris);
    }
    if (spec.id === 300) {
      ring(lens, .69, .06, 0, 0, 1.7, black); box(lens, .30, .43, .28, 0, -.83, 1.7); box(lens, .64, .09, .55, 0, -1.05, 1.7);
      barrelText(lens, 'ED', radius + .008, end - .12, -.55, .19, '#c6ad6f');
    }
    // Hit-test the front element as focus without overwriting aperture tags.
    lens.traverse(o => { if (o.isMesh && !o.userData.part) o.userData.part = 'focus'; });
    lens.userData.radius = radius; lens.userData.focusZ = scaleZ; lens.userData.apertureZ = start + .16;
  }

  function updateCallout() {
    if (!activePart || !lensSpec || !currentState) { halo.visible = false; callout.hidden = true; return; }
    const r = lens.userData.radius;
    if (activePart === 'shutter') {
      halo.position.set(-1.03 + shell.position.x, 1.38, -.13); halo.rotation.set(-Math.PI / 2, 0, 0); halo.scale.setScalar(1);
    } else {
      halo.position.set(0, 0, (activePart === 'aperture' ? lens.userData.apertureZ : lens.userData.focusZ) + lens.position.z);
      halo.rotation.set(0, 0, 0); halo.scale.setScalar((r + .07) / .42);
    }
    halo.visible = !(activePart === 'aperture' && lensSpec.id === 500);
    callout.hidden = false;
    const label = activePart === 'shutter' ? `Shutter dial · 1/${currentState.shutter} s` : activePart === 'aperture' ? lensSpec.id === 500 ? 'Fixed f/8 · no aperture ring' : `Aperture ring · f/${currentState.aperture}` : `Focus ring · ${currentState.focus >= 100 ? Math.round(currentState.focus) : currentState.focus.toFixed(1)} m`;
    if (callout.textContent !== label) callout.textContent = label;
  }
  function render() { if (!disposed) { updateCallout(); renderer.render(scene, camera); } }
  function updatePath() {
    if (lightPath) { root.remove(lightPath); lightPath.geometry.dispose(); lightPath.material.dispose(); }
    const end = .79 + lensSpec.length + .42 + lens.position.z;
    const p = lensSpec.id === 500 ? [[.4, 0, end + .5], [.4, 0, 1 + lens.position.z], [0, 0, end - .1], [0, 0, .8 + lens.position.z]] : [[0, 0, end + .5], [0, 0, .8 + lens.position.z]];
    if (phase === 'expose') p.push([0, 0, film.position.z]);
    else p.push([0, 0, .1], [0, .9 + finder.position.y, .1], [0, 1.4 + finder.position.y, -.7]);
    lightPath = new THREE.Line(new THREE.BufferGeometry().setFromPoints(p.map(v => new THREE.Vector3(...v))), new THREE.LineBasicMaterial({ color: 0x428e76, depthTest: false }));
    lightPath.renderOrder = 5; lightPath.visible = mode === 'cutaway'; root.add(lightPath);
  }
  function publishPositions() {
    // Also provides inspectable, semantic state for browser verification.
    host.dataset.shutterRotation = shutterDial.rotation.y.toFixed(6);
    host.dataset.apertureRotation = apertureRing ? apertureRing.rotation.z.toFixed(6) : 'fixed';
    host.dataset.focusRotation = focusRing.rotation.z.toFixed(6);
    host.dataset.activePart = activePart || '';
  }
  function animateRings(immediate) {
    cancelAnimationFrame(animation);
    const from = { shutter: shutterDial.rotation.y, aperture: apertureRing?.rotation.z || 0, focus: focusRing.rotation.z };
    const apply = t => {
      shutterDial.rotation.y = THREE.MathUtils.lerp(from.shutter, targets.shutter, t);
      if (apertureRing) apertureRing.rotation.z = THREE.MathUtils.lerp(from.aperture, targets.aperture, t);
      focusRing.rotation.z = THREE.MathUtils.lerp(from.focus, targets.focus, t);
      publishPositions(); render();
    };
    if (immediate || reducedMotion.matches || document.hidden) { apply(1); return; }
    const start = performance.now();
    const tick = now => { const t = Math.min(1, (now - start) / 180); apply(1 - (1 - t) ** 3); if (t < 1 && !disposed) animation = requestAnimationFrame(tick); };
    animation = requestAnimationFrame(tick);
  }
  function update(state, spec) {
    const first = !currentState, newLens = !lensSpec || lensSpec.id !== spec.id;
    currentState = { ...state };
    if (newLens) { cancelAnimationFrame(animation); buildLens(spec); }
    const exploded = mode === 'exploded';
    lens.position.z = exploded ? 3.7 : 0; finder.position.y = exploded ? 3.0 : 0; back.position.z = exploded ? -5.0 : 0;
    film.position.z = exploded ? -3.5 : -.48; shell.position.x = exploded ? -4.3 : 0;
    shutter.position.z = exploded ? -1.6 : 0;
    pivot.position.z = exploded ? 1.25 : .10;
    focusingScreen.position.y = exploded ? 2.05 : .80;
    mechanics.position.x = exploded ? 2.2 : 0;
    host.dataset.modelMode = mode;
    shell.visible = mode !== 'cutaway'; back.visible = mode !== 'cutaway'; inner.visible = mode !== 'assembled';
    const section = mode === 'cutaway';
    for (const child of lens.children) child.visible = !section || child === barrel || child === opticsGroup || child === iris;
    barrel.geometry = section ? barrelSection : barrelFull;
    barrel.material = section ? cutawayMaterial : black;
    prism.material = section ? cutawayMaterial : black;
    pivot.rotation.x = phase === 'expose' ? -Math.PI / 2 : -Math.PI / 4; shutter.visible = phase !== 'expose';
    if (iris) {
      const n = phase === 'compose' || phase === 'return' ? spec.max : state.aperture;
      iris.geometry.dispose(); iris.geometry = new THREE.RingGeometry(lens.userData.radius * .67 * spec.max / n, lens.userData.radius * .72, 9);
    }
    opticsGroup.position.z = .12 / state.focus;
    targets = { shutter: -SHUTTER_MARKS.indexOf(String(state.shutter)) / SHUTTER_MARKS.length * Math.PI * 2, aperture: spec.id === 500 ? 0 : apertureAngle(state.aperture, spec.max), focus: focusAngle(state.focus) };
    updatePath(); animateRings(first || newLens);
    if (newLens && activePart) positionInspection(activePart);
    else if (newLens) view('three');
  }
  function positionInspection(part) {
    const r = lens.userData.radius, z = (part === 'aperture' ? lens.userData.apertureZ : lens.userData.focusZ) + lens.position.z;
    if (part === 'shutter') {
      controls.target.set(-1.02 + shell.position.x, 1.18, -.1); camera.position.set(-1.02 + shell.position.x, 3.85, 1.65);
    } else {
      controls.target.set(0, r * .4, z); camera.position.set(.55, 2.55 + r, z + 1.7);
    }
    controls.update(); render();
  }
  function inspect(part) {
    if (!['shutter', 'aperture', 'focus'].includes(part)) return;
    if (activePart !== part) { activePart = part; positionInspection(part); }
    publishPositions(); render();
  }
  controls.addEventListener('change', render);
  const resize = new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); render();
  }); resize.observe(host);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const visible = obj => { for (let o = obj; o; o = o.parent) if (!o.visible) return false; return true; };
    const hit = raycaster.intersectObjects(root.children, true).find(h => visible(h.object) && h.object.userData.part);
    if (hit) onPart(hit.object.userData.part);
  });
  function view(value) {
    activePart = null;
    const z = lensSpec?.id === 300 ? 1.1 : .7;
    camera.position.set(...(value === 'front' ? [0, .6, 8] : value === 'rear' ? [0, 2.1, -6] : value === 'side' ? [8, 1.3, 1] : value === 'top' ? [0, 7.5, .8] : [-3.6, 2.7, 5.8]));
    controls.target.set(0, .2, z);
    if (lensSpec?.id === 300) camera.position.sub(controls.target).multiplyScalar(1.22).add(controls.target);
    controls.update(); publishPositions(); render();
  }
  return {
    update, inspect,
    setMode(value) { mode = value; activePart = null; if (value === 'exploded') { camera.position.set(-10, 7, 13); controls.target.set(0, .8, .2); controls.update(); } else view('three'); },
    setPhase(value) { phase = value; }, view,
    dispose() { disposed = true; cancelAnimationFrame(animation); resize.disconnect(); controls.dispose(); environment.dispose(); leatherMap.dispose(); renderer.dispose(); callout.remove(); }
  };
}
