# Photography / F3 Camera Workshop

An interactive photography learning project built around the Nikon F3. Explore a camera in 3D, turn its controls, and learn why a particular shot calls for a different aperture, shutter speed, focus distance, or lens.

I’m building this to learn photography and share the process. It is a work in progress, not a camera repair guide or a calibrated film simulator.

## The workshop

- Inspect the camera assembled, in cutaway, or exploded, including its film path and optical components.
- Watch the shutter-speed dial, aperture ring, and focus ring respond to settings.
- Compare 28mm and 50mm teaching lenses, the Nikkor 300mm f/4.5 AI-S ED-IF, and the fixed-aperture Reflex-Nikkor 500mm f/8.
- Explore Kodak Portra 400 and CineStill 800T exposure and color-balance approximations.
- Practice with four photographic scenes, a parts guide, and scenario questions with explanations.
- Capture simulated frames to a temporary contact sheet and revisit their settings.

The prototype currently exists locally. This repository starts with the project documentation and license; application source will follow. There is no public deployment yet.

## Development

The local prototype uses JavaScript, Three.js, and Vite. Once the application source is published:

```sh
npm ci
npm run dev:raw
```

Open the local URL printed by Vite. WebGL is required for the 3D view. The optional `npm run dev` command uses [portless](https://github.com/vercel-labs/portless) to serve `http://f3-workshop.localhost:1355`.

```sh
npm test       # Optics calculations
npm run build # Production files in dist/
```

Local contributors with the workspace verification wrapper should run tests and builds through that wrapper, as described in `CLAUDE.md` when the source is available.

## Accuracy and references

Exposure, horizontal angle of view, and thin-lens depth of field are calculated. Geometry, control travel, internal mechanisms, image blur, and film color are teaching approximations. The camera is not a measured reconstruction. The exact generation of the Reflex-Nikkor remains unconfirmed.

The photographic scenes are stock reference plates, not photographs made with the modeled lenses or films. Cropping demonstrates relative framing; it does not demonstrate lens sharpness. The prototype does not simulate depth-dependent bokeh, calibrated film response, grain, halation, reciprocity, or processing. Captured frames and practice progress are not saved after reload.

Research uses Nikon F3 operating and repair documentation alongside reference photographs. Repair diagrams guide the explanation of mechanisms; they do not make the model suitable for servicing a real camera.

## Planned home

The workshop will be deployed on a dedicated subdomain after the build is ready. A `/photography` page in my personal site’s new experience will introduce the project and link to it. The domain and deployment configuration have not been set up yet.

## License

Original project code is licensed under the [MIT License](LICENSE).

Third-party photographs, manuals, diagrams, trademarks, and dependency code are not relicensed by this project. They retain their respective rights and licenses. Reference manual scans are local research material and are not included in the public repository. Photographic source attribution will accompany published application assets.

This is an independent learning project, unaffiliated with Nikon, Kodak, or CineStill.
