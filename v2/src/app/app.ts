import {
  Component,
  ElementRef,
  inject,
  signal,
  type AfterViewInit,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

const EMAIL_JS_PUBLIC_KEY = 'THIA4iGpznRDahfiY';
const EMAIL_JS_SERVICE_ID = 'service_fasx1uh';
const EMAIL_JS_TEMPLATE_ID = 'template_rcoqv39';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private introTimer?: ReturnType<typeof setTimeout>;
  private typingTimer?: ReturnType<typeof setInterval>;
  private revealObserver?: IntersectionObserver;
  private readonly greeting = 'Bonjour, je suis';
  private greetingIndex = 0;

  protected readonly currentYear = new Date().getFullYear();
  protected readonly isIntroVisible = signal(true);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly typedGreeting = signal('');
  protected readonly isGreetingComplete = signal(false);
  protected readonly activeJourneyIndex = signal(0);
  protected readonly isSubmittingContact = signal(false);
  protected readonly contactFeedback = signal<{
    kind: 'error';
    message: string;
  } | null>(null);
  protected contactFormData = {
    userName: '',
    userEmail: '',
    userSubject: '',
    userMessage: '',
  };
  protected readonly journeySteps = [
    {
      period: '2026 · EN COURS',
      title: 'Licence professionnelle',
      description: 'Réseaux et Génie Logiciel',
      place: 'Pigier CI · Antenne Yamoussoukro',
    },
    {
      period: 'SEPT. 2025 — JUIL. 2026',
      title: 'Informaticien développeur d’application',
      description: 'EBARRE-CI',
      place: '',
    },
    {
      period: '2024 — 2025',
      title: 'Licence 2e année',
      description: 'Réseaux et Génie Logiciel',
      place: 'Pigier CI · Antenne Yamoussoukro',
    },
  ];

  protected get journeyProgress(): number {
    return (this.activeJourneyIndex() / (this.journeySteps.length - 1)) * 100;
  }

  protected selectJourneyStep(index: number): void {
    this.activeJourneyIndex.set(index);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  ngOnInit(): void {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    this.introTimer = setTimeout(
      () => {
        this.isIntroVisible.set(false);
        this.startGreetingTyping(reducedMotion);
      },
      reducedMotion ? 250 : 1500,
    );
  }

  ngAfterViewInit(): void {
    const revealElements =
      this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal-on-scroll');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealElements.forEach((element) => this.revealObserver?.observe(element));
  }

  ngOnDestroy(): void {
    if (this.introTimer) {
      clearTimeout(this.introTimer);
    }
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }
    this.revealObserver?.disconnect();
  }

  private startGreetingTyping(reducedMotion: boolean): void {
    if (reducedMotion) {
      this.typedGreeting.set(this.greeting);
      this.isGreetingComplete.set(true);
      return;
    }

    this.typingTimer = setInterval(() => {
      this.greetingIndex += 1;
      this.typedGreeting.set(this.greeting.slice(0, this.greetingIndex));

      if (this.greetingIndex >= this.greeting.length && this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = undefined;
        this.isGreetingComplete.set(true);
      }
    }, 75);
  }

  protected async sendContactMessage(form: NgForm): Promise<void> {
    if (form.invalid || this.isSubmittingContact()) {
      form.control.markAllAsTouched();
      return;
    }

    const userName = this.contactFormData.userName.trim();
    const userEmail = this.contactFormData.userEmail.trim();
    const userSubject = this.contactFormData.userSubject.trim();
    const userMessage = this.contactFormData.userMessage.trim();

    if (!userSubject || !userMessage) {
      this.contactFeedback.set({
        kind: 'error',
        message: 'Indique un objet et écris ton message avant de l’envoyer.',
      });
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿĀ-ž\s'-]+$/u.test(userName)) {
      this.contactFeedback.set({
        kind: 'error',
        message:
          'Le nom doit contenir uniquement des lettres, espaces, apostrophes ou traits d’union.',
      });
      return;
    }

    if (
      userName.length > 80 ||
      userEmail.length > 254 ||
      userSubject.length > 120 ||
      userMessage.length > 5000
    ) {
      this.contactFeedback.set({
        kind: 'error',
        message: 'Un ou plusieurs champs dépassent la longueur autorisée.',
      });
      return;
    }

    this.isSubmittingContact.set(true);
    this.contactFeedback.set(null);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAIL_JS_SERVICE_ID,
          template_id: EMAIL_JS_TEMPLATE_ID,
          user_id: EMAIL_JS_PUBLIC_KEY,
          template_params: {
            userName,
            userEmail,
            userSubject,
            userMessage,
          },
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('EmailJS a refusé la requête :', response.status, errorDetails);
        const errorMessage =
          response.status === 404
            ? 'EmailJS ne reconnaît pas la clé publique, le Service ID ou le Template ID. Recopie les trois depuis le même compte EmailJS, puis redéploie le site.'
            : response.status === 412
            ? 'EmailJS refuse l’adresse de ce site. Dans EmailJS, ouvre Account > Security > Allowed Origins et ajoute l’origine exacte (par exemple http://localhost:4200 ou l’adresse de ton site en ligne).'
            : response.status === 400
            ? 'EmailJS a refusé la demande. Vérifie le service, le modèle et les noms des variables configurés.'
            : response.status === 403
              ? 'EmailJS a bloqué la requête. Vérifie que le domaine de ce site est autorisé dans EmailJS.'
              : response.status === 429
                ? 'La limite d’envoi est atteinte. Réessaie plus tard.'
                : `Le service e-mail a répondu avec une erreur (${response.status}). Réessaie plus tard.`;
        throw new Error(errorMessage);
      }
      form.resetForm();
      void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Message envoyé avec succès !',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        background: '#202f3b',
        color: '#f5f3ed',
        customClass: {
          popup: 'portfolio-toast',
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de contact :", error);
      this.contactFeedback.set({
        kind: 'error',
        message:
          error instanceof TypeError
            ? 'Connexion au service e-mail impossible. Vérifie ta connexion et les domaines autorisés dans EmailJS.'
            : error instanceof Error
              ? error.message
              : "L'envoi a échoué. Réessaie ou écris-moi directement par courriel.",
      });
    } finally {
      this.isSubmittingContact.set(false);
    }
  }
}
