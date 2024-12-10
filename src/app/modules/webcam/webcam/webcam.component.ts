import {AfterViewInit, Component, ElementRef, input, Input, OnDestroy, output, ViewChild} from '@angular/core';
import {WebcamInitError} from '../domain/webcam-init-error';
import {IMAGE_TYPE, WebcamImage} from '../domain/webcam-image';
import {Observable, Subscription} from 'rxjs';
import {WebcamUtil} from '../util/webcam.util';
import {WebcamMirrorProperties} from '../domain/webcam-mirror-properties';
import {NgClass, NgStyle} from '@angular/common';

@Component({
  selector: 'ngx-webcam',
  templateUrl: './webcam.component.html',
  imports: [
    NgClass,
    NgStyle
  ]
})
export class WebcamComponent implements AfterViewInit, OnDestroy {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {facingMode: 'environment'};
  private static DEFAULT_IMAGE_QUALITY = 0.92;
  readonly backgroundImageUrl: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAE9UlEQVR42u2aT2hdRRTGf+cRQqghSqihdBFDkRISK2KDfzDWxHaRQHEhaINKqa1gKQhd6EZLN+IidCH+Q0oWIkVRC21BQxXRitVaSbKoJSGtYGoK2tQ/tU1jY5v0c5F54Xl7b/KSO/PyEt+3e5f75p7zzZwzZ74zUEIJJfyfYaEGllQGVAGZlENdBy6Z2cSiYFTSKkkfS/pH/nBF0kFJdUW9AiRVASeAukD8DgNrzOySrwEzng18KaDzALXuG8W3AiStAvqBisBRNg40mtlPxbYCOgvgPO4bncWW+JpVeDQXRQhIygDfA00F5r0XuNfMrgclQFI98DDQCNQA5ZFXqoCWBVp8XwHRHeEqcN7loy/NbHBesyqpQ1KfFj/6nC+ZvFaApFrgPaCZpYVvgCfNbDiRAElNwGFg+RIt/X8H2s2s9wYCJDUAR4HqJX7++RN40MwGpgmQVAH0AQ2BPz4AHHPl8nBOAqtyFWQjsA6oL4Ada81sPDv7uwImod8kvSJp9RyS8O2SXnb/DYVd2Y9VSroQ4ANXJO2WVJmixqh0kzMWwL4LkiqRtDnA4D1zmfE8j9g9AezcnAHaPcfXdbfdnPZ2Yps6+DwAvO/Z1naTdApY7Xng48BDZnY1MpMVQBuw3iXc5Tnb0wBwBPjUzP6eoezuArZ6svM0geJLkvZEYnl3nkntoqROSbckSW2Suj3ZOIangc7GPJuUtNGdFIfmMeavktoSSKiW9LMPw30Q8JqkekmjCbOZRhuclLQjgYSNxUBAj6RyZ9ATgUJpUtJTCSR8vpAEXHAyWK5BXYFIGHOlepSAloUk4NEYgyoknQhEwhFJ0e8h6VSaQuerCb5uZgdi9utxYBNwOUD93hIVXswM4INCi6K9wAszFC2DwLOBDjHbYp59karIUnRdzYy/3ClqVklaUhfwTICj7K25OqA7a4wWagVsm4Me/xzwg2cCqqONFzO7DPxSCAJi436GUBgHHguQD2oTlJ55oSzP9ybccsttSJw1szdjFOSnI/8dTCGZHwcORp4Nx7y3B1iZ8/sm4MW8/Euxg5wIsS/HaAp3zeP4/G7obRDXI4jiTIA22H7Xdc7X+S3A5lC7QBQ357aq3VAjCeSkwUfAJrfvz+R8A9ADLAtZB+TinpjC5JMA+//jwPZZnF8G7J+L8z4IWB/zbG+gIujVWfLBW/NStVMmqaG4POJRsIjix7h8IGnLQuoBbQki5sVAJHyYm7YkNaRRtXwQ8G1cHpX0iKRrgUjYno17Sf0LrQhJUkdCeHWkVITGJI0k1QeS3ikGSUzOyJUJJNznYneuOCnpTldcxa2kP3xJYqOeSDjqZG8ShJLnE8TTuMS6Iyu1BW7djZqkfo9N0QOuYJmYQddfB7RG+gLTNzqAY9FrL+5/nwEbvDdJJe3zzOrhNP3AWRqmk55t3ZcBuj3b2gb0Sbrbo/NNzk7fFzu7s/E5EiC+rrmeQU0Kx2skvRFoOx2ZzlmSdgbsw49JetvtBpk8nM64d/cGbNtJ0s7cGyJlwHeEv+t3nqnLSgPAUOSGyG3AHUxdzqoJbEcvcL+ZTeTeEapzJKxgaeOcc/7Mf06D7kFrguS0VDAMtGadv+E47DT9tcChJej8ISfpD+abgTe45uOkFi8mnQ+JBVQ+d4VXuOptjavcyot8pq86mfwk8LWZnaOEEkoooYQSSojDv8AhQNeGfe0jAAAAAElFTkSuQmCC';
  /** Defines the max width of the webcam area in px */
  width = input<number>(640);
  /** Defines the max height of the webcam area in px */
  height = input<number>(480);
  /** Defines base constraints to apply when requesting video track from UserMedia */
  videoOptions = input<MediaTrackConstraints>(WebcamComponent.DEFAULT_VIDEO_OPTIONS);
  /** Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found */
  allowCameraSwitch = input<boolean>(true);
  /** Parameter to control image mirroring (i.e. for user-facing camera). ["auto", "always", "never"] */
  mirrorImage = input<WebcamMirrorProperties>(WebcamMirrorProperties.AUTO);
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  captureImageData = input<boolean>(false);
  /** The image type to use when capturing snapshots */
  imageType = input<IMAGE_TYPE>(IMAGE_TYPE.JPEG);
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  imageQuality = input<number>(WebcamComponent.DEFAULT_IMAGE_QUALITY);

  /** EventEmitter which fires when an image has been captured */
  imageCapture = output<WebcamImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  initError = output<WebcamInitError>();
  /** Emits when the webcam video was clicked */
  imageClick = output<void>();
  /** Emits the active deviceId after the active video device was switched */
  cameraSwitched = output<string>();

  /** available video devices */
  public availableVideoInputs: MediaDeviceInfo[] = [];

  /** Indicates whether the video device is ready to be switched */
  public videoInitialized = false;

  /** If the Observable represented by this subscription emits, an image will be captured and emitted through
   * the 'imageCapture' EventEmitter */
  private triggerSubscription: Subscription;
  /** Index of active video in availableVideoInputs */
  private activeVideoInputIndex = -1;
  /** Subscription to switchCamera events */
  private switchCameraSubscription: Subscription;
  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream = null;
  @ViewChild('video', {static: true}) private video: ElementRef<HTMLVideoElement>;
  /** Canvas for Video Snapshots */
  @ViewChild('canvas', {static: true}) private canvas: ElementRef<HTMLCanvasElement>;

  /**
   * If the given Observable emits, an image will be captured and emitted through 'imageCapture' EventEmitter
   */
  @Input()
  public set trigger(trigger: Observable<void>) {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerSubscription = trigger.subscribe(() => {
      this.takeSnapshot();
    });
  }

  /**
   * If the given Observable emits, the active webcam will be switched to the one indicated by the emitted value.
   * @param switchCamera Indicates which webcam to switch to
   *   true: cycle forwards through available webcams
   *   false: cycle backwards through available webcams
   *   string: activate the webcam with the given id
   */
  @Input()
  public set switchCamera(switchCamera: Observable<boolean | string>) {
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to switch video device
    this.switchCameraSubscription = switchCamera.subscribe((value: boolean | string) => {
      if (typeof value === 'string') {
        // deviceId was specified
        this.switchToVideoInput(value);
      } else {
        // direction was specified
        this.rotateVideoInput(value !== false);
      }
    });
  }

  public get videoWidth() {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.width(), this.height() * videoRatio);
  }

  public get videoHeight() {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.height(), this.width() / videoRatio);
  }

  public get videoStyleClasses(): boolean {
    return this.isMirrorImage();
  }

  public get nativeVideoElement() {
    return this.video.nativeElement;
  }

  /**
   * Get MediaTrackConstraints to request streaming the given device
   * @param deviceId
   * @param baseMediaTrackConstraints base constraints to merge deviceId-constraint into
   * @returns
   */
  private static getMediaConstraintsForDevice(deviceId: string, baseMediaTrackConstraints: MediaTrackConstraints): MediaTrackConstraints {
    const result: MediaTrackConstraints = baseMediaTrackConstraints ? baseMediaTrackConstraints : this.DEFAULT_VIDEO_OPTIONS;
    if (deviceId) {
      result.deviceId = {exact: deviceId};
    }

    return result;
  }

  /**
   * Tries to harvest the deviceId from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the id.
   * @param mediaStreamTrack
   * @returns deviceId if found in the mediaStreamTrack
   */
  private static getDeviceIdFromMediaStreamTrack(mediaStreamTrack: MediaStreamTrack): string {
    if (mediaStreamTrack.getSettings && mediaStreamTrack.getSettings() && mediaStreamTrack.getSettings().deviceId) {
      return mediaStreamTrack.getSettings().deviceId;
    } else if (mediaStreamTrack.getConstraints && mediaStreamTrack.getConstraints() && mediaStreamTrack.getConstraints().deviceId) {
      const deviceIdObj: ConstrainDOMString = mediaStreamTrack.getConstraints().deviceId;
      return WebcamComponent.getValueFromConstrainDOMString(deviceIdObj);
    }
  }

  /**
   * Tries to harvest the facingMode from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the value.
   * @param mediaStreamTrack
   * @returns facingMode if found in the mediaStreamTrack
   */
  private static getFacingModeFromMediaStreamTrack(mediaStreamTrack: MediaStreamTrack): string {
    if (mediaStreamTrack) {
      if (mediaStreamTrack.getSettings && mediaStreamTrack.getSettings() && mediaStreamTrack.getSettings().facingMode) {
        return mediaStreamTrack.getSettings().facingMode;
      } else if (mediaStreamTrack.getConstraints && mediaStreamTrack.getConstraints() && mediaStreamTrack.getConstraints().facingMode) {
        const facingModeConstraint: ConstrainDOMString = mediaStreamTrack.getConstraints().facingMode;
        return WebcamComponent.getValueFromConstrainDOMString(facingModeConstraint);
      }
    }
  }

  /**
   * Determines whether the given mediaStreamTrack claims itself as user facing
   * @param mediaStreamTrack
   */
  private static isUserFacing(mediaStreamTrack: MediaStreamTrack): boolean {
    const facingMode: string = WebcamComponent.getFacingModeFromMediaStreamTrack(mediaStreamTrack);
    return facingMode ? 'user' === facingMode.toLowerCase() : false;
  }

  /**
   * Extracts the value from the given ConstrainDOMString
   * @param constrainDOMString
   */
  private static getValueFromConstrainDOMString(constrainDOMString: ConstrainDOMString): string {
    if (constrainDOMString) {
      if (constrainDOMString instanceof String) {
        return String(constrainDOMString);
      } else if (Array.isArray(constrainDOMString) && Array(constrainDOMString).length > 0) {
        return String(constrainDOMString[0]);
      } else if (typeof constrainDOMString === 'object') {
        if (constrainDOMString['exact']) {
          return String(constrainDOMString['exact']);
        } else if (constrainDOMString['ideal']) {
          return String(constrainDOMString['ideal']);
        }
      }
    }

    return null;
  }

  public ngAfterViewInit(): void {
    this.detectAvailableDevices()
      .then(() => {
        // start video
        this.switchToVideoInput(null);
      })
      .catch((err: string) => {
        this.initError.emit({message: err} as WebcamInitError);
        // fallback: still try to load webcam, even if device enumeration failed
        this.switchToVideoInput(null);
      });
  }

  public ngOnDestroy(): void {
    this.stopMediaTracks();
    this.unsubscribeFromSubscriptions();
  }

  /**
   * Takes a snapshot of the current webcam's view and emits the image as an event
   */
  public takeSnapshot(): void {
    // set canvas size to actual video size
    const _video = this.nativeVideoElement;
    const dimensions = {width: this.width(), height: this.height()};
    if (_video.videoWidth) {
      dimensions.width = _video.videoWidth;
      dimensions.height = _video.videoHeight;
    }

    const _canvas = this.canvas.nativeElement;
    _canvas.width = dimensions.width;
    _canvas.height = dimensions.height;

    // paint snapshot image to canvas
    const context2d = _canvas.getContext('2d');
    context2d.drawImage(_video, 0, 0);

    // read canvas content as image
    const mimeType: string = this.imageType();
    const quality: number = this.imageQuality();
    const dataUrl: string = _canvas.toDataURL(mimeType, quality);

    // get the ImageData object from the canvas' context.
    let imageData: ImageData = null;

    if (this.captureImageData()) {
      imageData = context2d.getImageData(0, 0, _canvas.width, _canvas.height);
    }

    this.imageCapture.emit(new WebcamImage(dataUrl, mimeType, imageData));
  }

  /**
   * Switches to the next/previous video device
   * @param forward
   */
  public rotateVideoInput(forward: boolean) {
    if (this.availableVideoInputs && this.availableVideoInputs.length > 1) {
      const increment: number = forward ? 1 : (this.availableVideoInputs.length - 1);
      const nextInputIndex = (this.activeVideoInputIndex + increment) % this.availableVideoInputs.length;
      this.switchToVideoInput(this.availableVideoInputs[nextInputIndex].deviceId);
    }
  }

  /**
   * Switches the camera-view to the specified video device
   */
  public switchToVideoInput(deviceId: string): void {
    this.videoInitialized = false;
    this.stopMediaTracks();
    this.initWebcam(deviceId, this.videoOptions());
  }

  /**
   * Event-handler for video resize event.
   * Triggers Angular change detection so that new video dimensions get applied
   */
  public videoResize(): void {
    // here to trigger Angular change detection
  }

  public isMirrorImage(): boolean {
    if (!this.getActiveVideoTrack()) {
      return false;
    }

    switch (this.mirrorImage()) {
      case WebcamMirrorProperties.ALWAYS:
        return true;
      case WebcamMirrorProperties.NEVER:
        return false;
      case WebcamMirrorProperties.AUTO:
      default:
        return WebcamComponent.isUserFacing(this.getActiveVideoTrack());
    }
  }

  /**
   * Returns the video aspect ratio of the active video stream
   */
  private getVideoAspectRatio(): number {
    // calculate ratio from video element dimensions if present
    const videoElement = this.nativeVideoElement;
    if (videoElement.videoWidth && videoElement.videoWidth > 0 &&
      videoElement.videoHeight && videoElement.videoHeight > 0) {

      return videoElement.videoWidth / videoElement.videoHeight;
    }

    // nothing present - calculate ratio based on width/height params
    return this.width() / this.height();
  }

  /**
   * Init webcam live view
   */
  private initWebcam(deviceId: string, userVideoTrackConstraints: MediaTrackConstraints) {
    const _video = this.nativeVideoElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      // merge deviceId -> userVideoTrackConstraints
      const videoTrackConstraints = WebcamComponent.getMediaConstraintsForDevice(deviceId, userVideoTrackConstraints);

      navigator.mediaDevices.getUserMedia({video: videoTrackConstraints} as MediaStreamConstraints)
        .then((stream: MediaStream) => {
          this.mediaStream = stream;
          _video.srcObject = stream;
          _video.play();

          const activeDeviceId: string = WebcamComponent.getDeviceIdFromMediaStreamTrack(stream.getVideoTracks()[0]);

          this.cameraSwitched.emit(activeDeviceId);

          // Initial detect may run before user gave permissions, returning no deviceIds. This prevents later camera switches. (#47)
          // Run detect once again within getUserMedia callback, to make sure this time we have permissions and get deviceIds.
          this.detectAvailableDevices()
            .then(() => {
              this.activeVideoInputIndex = activeDeviceId ? this.availableVideoInputs
                .findIndex((mediaDeviceInfo: MediaDeviceInfo) => mediaDeviceInfo.deviceId === activeDeviceId) : -1;
              this.videoInitialized = true;
            })
            .catch(() => {
              this.activeVideoInputIndex = -1;
              this.videoInitialized = true;
            });
        })
        .catch((err: DOMException) => {
          this.initError.emit({message: err.message, mediaStreamError: err} as WebcamInitError);
        });
    } else {
      this.initError.emit({message: 'Cannot read UserMedia from MediaDevices.'} as WebcamInitError);
    }
  }

  private getActiveVideoTrack(): MediaStreamTrack {
    return this.mediaStream ? this.mediaStream.getVideoTracks()[0] : null;
  }

  /**
   * Stops all active media tracks.
   * This prevents the webcam from being indicated as active,
   * even if it is no longer used by this component.
   */
  private stopMediaTracks() {
    if (this.mediaStream && this.mediaStream.getTracks) {
      // pause video to prevent mobile browser freezes
      this.nativeVideoElement.pause();

      // getTracks() returns all media tracks (video+audio)
      this.mediaStream.getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
  }

  /**
   * Unsubscribe from all open subscriptions
   */
  private unsubscribeFromSubscriptions() {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }
  }

  /**
   * Reads available input devices
   */
  private detectAvailableDevices(): Promise<MediaDeviceInfo[]> {
    return new Promise((resolve, reject) => {
      WebcamUtil.getAvailableVideoInputs()
        .then((devices: MediaDeviceInfo[]) => {
          this.availableVideoInputs = devices;
          resolve(devices);
        })
        .catch(err => {
          this.availableVideoInputs = [];
          reject(err);
        });
    });
  }

}
