import { html, LitElement, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { PermissionsController } from 'relit';
import { Task } from '@lit/task';
import { choose } from 'lit/directives/choose.js';

type coords = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;

@customElement('app-permission')
export class AppHome extends LitElement {
  @state()
  latitude: number | undefined = 52.522138048058856;

  @state()
  longitude: number | undefined = 13.394977670545542;

  private _geoPermissionController = new PermissionsController(
    this,
    'geolocation'
  );

  private _getGpsPosition(
    options: PositionOptions = { enableHighAccuracy: true }
  ): Promise<coords> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => reject(error),
        options
      );
    });
  }

  private _gpsPositionTask = new Task(this, {
    task: () => this._getGpsPosition(),
    onComplete: (coords) => {
      this.latitude = coords.latitude;
      this.longitude = coords.longitude;
    },
    autoRun: false,
    args: () => [this.latitude, this.longitude] as const,
  });

  private _permissionPending = () => {
    return html`
      <sl-button
        @click=${() => {
          this._gpsPositionTask.run();
        }}
      >
        Ask for location permission
      </sl-button>
    `;
  };

  private _permissionDenied = () => html`
    <sl-button variant="warning">we got a problem</sl-button>
  `;

  private _permissionGranted = () => html`
    <sl-button @click=${() => this._gpsPositionTask.run()} variant="primary">
      Get GPS Position
    </sl-button>
  `;

  private _gpsButtonTemplate = (state: PermissionState) => html`
    ${choose<PermissionState, TemplateResult>(state, [
      ['prompt', () => this._permissionPending()],
      ['granted', () => this._permissionGranted()],
      ['denied', () => this._permissionDenied()],
    ])}
  `;

  render() {
    return html`
      <h2>Permission works</h2>
      <p>${this._geoPermissionController.state}</p>

      ${'geolocation' in navigator
        ? this._gpsButtonTemplate(this._geoPermissionController.state)
        : null}
    `;
  }
}

