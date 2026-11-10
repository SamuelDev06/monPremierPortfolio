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

const EMAIL_JS_PUBLIC_KEY = 'h6yidSSqwznx04Ngq';
const EMAIL_JS_SERVICE_ID = 'service_fmqasui';
const EMAIL_JS_TEMPLATE_ID = 'template_rsc8nul';

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
  protected readonly typedGreeting = signal('');
  protected readonly activeJourneyIndex = signal(0);
  protected readonly isSubmittingContact = signal(false);
  protected readonly contactFeedback = signal<{
    kind: 'success' | 'error';
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
      return;
    }

    this.typingTimer = setInterval(() => {
      this.greetingIndex += 1;
      this.typedGreeting.set(this.greeting.slice(0, this.greetingIndex));

      if (this.greetingIndex >= this.greeting.length && this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = undefined;
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

    if (!/^[\p{L}\s'-]+$/u.test(userName)) {
      this.contactFeedback.set({
        kind: 'error',
        message: 'Le nom doit contenir uniquement des lettres.',
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
        throw new Error(`EmailJS a répondu ${response.status}: ${errorDetails}`);
      }

      this.contactFeedback.set({
        kind: 'success',
        message: 'Votre message a été envoyé avec succès.',
      });
      form.resetForm();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de contact :", error);
      this.contactFeedback.set({
        kind: 'error',
        message: "L'envoi a échoué. Veuillez réessayer ou m'écrire directement par courriel.",
      });
    } finally {
      this.isSubmittingContact.set(false);
    }
  }
}
