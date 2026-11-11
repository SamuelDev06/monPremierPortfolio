import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import Swal, { type SweetAlertResult } from 'sweetalert2';
import { App } from './app';

describe('App', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the portfolio heading', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Jean Samuel');
  });

  it('should use the personal logo in the intro, header, and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const logos = element.querySelectorAll<HTMLImageElement>(
      '.brand-logo',
    );

    expect(logos).toHaveLength(3);
    logos.forEach((logo) => {
      expect(logo.getAttribute('src')).toBe('/img/monlogo.png');
    });
  });

  it('should display the portrait in the journey section', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const portrait = element.querySelector<HTMLImageElement>('.journey-photo');

    expect(portrait?.getAttribute('src')).toBe('/img/maphoto.png');
    expect(portrait?.alt).toBe('Portrait de Jean Samuel');
  });

  it('should open the mobile navigation and close it after selecting a link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector<HTMLButtonElement>('.nav-toggle')!;
    const navigation = element.querySelector<HTMLElement>('.site-nav')!;
    const contactLink =
      navigation.querySelector<HTMLAnchorElement>('.header-contact')!;

    expect(contactLink.href).toBe('mailto:ogokonle@gmail.com');

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList.contains('is-open')).toBe(true);
    expect(contactLink.textContent).toContain('Discutons');

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(menuButton.getAttribute('aria-label')).toBe('Ouvrir le menu');
    expect(navigation.classList.contains('is-open')).toBe(false);

    menuButton.click();
    fixture.detectChanges();

    navigation.querySelector<HTMLAnchorElement>('a[href="#projets"]')!.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(navigation.classList.contains('is-open')).toBe(false);
  });

  it('should render the social profiles as safe external links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const socialLinks = element.querySelectorAll<HTMLAnchorElement>('.social-links a');

    expect(socialLinks).toHaveLength(4);
    expect(Array.from(socialLinks, (link) => link.href)).toEqual([
      'https://github.com/SamuelDev06',
      'https://www.linkedin.com/in/jean-samuel-ogokonl%C3%A9-83a5322bb?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
      'https://wa.me/qr/JPLKTXBF3EYFD1?s=r',
      'https://www.instagram.com/samy_on_line_713?psln=MW1mM2tkNWZ6ZHl4cw%3D%3D&utm_source=qr',
    ]);
    socialLinks.forEach((link) => {
      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noopener noreferrer');
    });
  });

  it('should select a journey step when its marker is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const markers =
      element.querySelectorAll<HTMLButtonElement>('.timeline-marker');
    markers[2].click();
    fixture.detectChanges();

    expect(markers[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('should refuse to send a message with a blank subject', async () => {
    const send = vi.spyOn(globalThis, 'fetch');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('#userName')!;
    const email = element.querySelector<HTMLInputElement>('#userEmail')!;
    const subject = element.querySelector<HTMLInputElement>('#userSubject')!;
    const message =
      element.querySelector<HTMLTextAreaElement>('#userMessage')!;
    name.value = 'Jean Samuel';
    email.value = 'jean@example.com';
    subject.value = '   ';
    message.value = 'Bonjour';
    [name, email, subject, message].forEach((input) =>
      input.dispatchEvent(new Event('input', { bubbles: true })),
    );

    element
      .querySelector<HTMLButtonElement>('.contact-submit')!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(send).not.toHaveBeenCalled();
    expect(element.querySelector('.form-feedback')?.textContent).toContain(
      'Indique un objet',
    );
  });

  it('should send trimmed contact details and show a success toast', async () => {
    const send = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));
    const successToast = vi
      .spyOn(Swal, 'fire')
      .mockResolvedValue({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
      } satisfies SweetAlertResult);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('#userName')!;
    const email = element.querySelector<HTMLInputElement>('#userEmail')!;
    const subject = element.querySelector<HTMLInputElement>('#userSubject')!;
    const message =
      element.querySelector<HTMLTextAreaElement>('#userMessage')!;
    name.value = ' Élodie Kouassi ';
    email.value = 'jean@example.com';
    subject.value = ' Portfolio ';
    message.value = ' Bonjour ';
    [name, email, subject, message].forEach((input) =>
      input.dispatchEvent(new Event('input', { bubbles: true })),
    );

    element
      .querySelector<HTMLButtonElement>('.contact-submit')!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(send).toHaveBeenCalledOnce();
    const requestBody = JSON.parse(String(send.mock.calls[0][1]?.body));
    expect(requestBody.template_params).toMatchObject({
      userName: 'Élodie Kouassi',
      userEmail: 'jean@example.com',
      userSubject: 'Portfolio',
      userMessage: 'Bonjour',
    });
    expect(successToast).toHaveBeenCalledWith(
      expect.objectContaining({
        toast: true,
        icon: 'success',
        title: 'Message envoyé avec succès !',
        timer: 3500,
      }),
    );
    expect(element.querySelector('.form-feedback')).toBeNull();
  });

  it('should explain how to allow the site origin after an EmailJS 412', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Origin not allowed', { status: 412 }),
    );
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('#userName')!;
    const email = element.querySelector<HTMLInputElement>('#userEmail')!;
    const subject = element.querySelector<HTMLInputElement>('#userSubject')!;
    const message = element.querySelector<HTMLTextAreaElement>('#userMessage')!;
    name.value = 'Jean Samuel';
    email.value = 'jean@example.com';
    subject.value = 'Portfolio';
    message.value = 'Bonjour';
    [name, email, subject, message].forEach((input) =>
      input.dispatchEvent(new Event('input', { bubbles: true })),
    );

    element.querySelector<HTMLButtonElement>('.contact-submit')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.form-feedback')?.textContent).toContain(
      'Account > Security > Allowed Origins',
    );
  });
});
