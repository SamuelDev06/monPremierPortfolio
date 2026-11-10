import { Component, signal } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

const EMAIL_JS_PUBLIC_KEY = 'h6yidSSqwznx04Ngq';
const EMAIL_JS_SERVICE_ID = 'service_fmqasui';
const EMAIL_JS_TEMPLATE_ID = 'template_rsc8nul';

@Component({
  imports: [FormsModule, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
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
