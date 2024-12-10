import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {WebcamComponent} from './webcam.component';


describe('WebcamComponent', () => {
  let component: WebcamComponent;
  let fixture: ComponentFixture<WebcamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WebcamComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a video tag', waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('video')).toBeTruthy();
  }));

  it('should render a canvas tag', waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
  }));

  it('should take snapshot without capturing the WebcamImage object', (done) => {
    const imageCapture$ = component.imageCapture;

    imageCapture$.subscribe(p => {
      expect(p.imageAsBase64).not.toBeNull();
      expect(p.imageAsBase64).not.toContain('data:');
      expect(p.imageAsBase64).not.toContain(';base64,');
      expect(p.imageAsDataUrl).not.toBeNull();
      expect(p.imageAsDataUrl).toContain('data:');
      expect(p.imageAsDataUrl).toContain(';base64,');
      expect(p.imageData).toBeNull();
      done();
    });

    component.takeSnapshot();
  });

  /*it('should take snapshot and capture the WebcamImage object', waitForAsync(() => {
    component.captureImageData = true;
    const imageCapture$ = component.imageCapture.asObservable();

    let base64: string = null;
    let dataUrl: string = null;
    let imageData: ImageData = null;

    imageCapture$
      .subscribe(p => {
        base64 = p.imageAsBase64;
        dataUrl = p.imageAsDataUrl;
        imageData = p.imageData;
      });
    component.takeSnapshot();

    expect(base64).not.toBeNull();
    expect(base64).not.toContain('data:');
    expect(base64).not.toContain(';base64,');
    expect(dataUrl).not.toBeNull();
    expect(dataUrl).toContain('data:');
    expect(dataUrl).toContain(';base64,');
    expect(imageData).not.toBeNull();
    expect(imageData.data).not.toBeNull();
  }));*/
});
