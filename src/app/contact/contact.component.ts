import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs, { EmailJSResponseStatus, send } from 'emailjs-com';

interface ContactForm {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  productType: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})

export class ContactComponent {

  contactForm: ContactForm = {
    name: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    productType: 'natalna karta',
    message: ''
  };

  isFormValid(): boolean {
    return !!(this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.birthDate &&
      this.contactForm.birthPlace);
  }

  submitContactForm() {
    if (this.isFormValid()) {
      
      alert(`🌟 Zahtev poslat! 🌟\n\nHvala ${this.contactForm.name}!\nKontaktiraću vas uskoro na ${this.contactForm.email} sa detaljima.`);
      
      this.sendEmail(this.contactForm);

      this.contactForm = {
        name: '',
        email: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        productType: 'natalna karta',
        message: ''
      };
    }


  }

  sendEmail(contactForm: ContactForm)  {
    emailjs.send(
      'service_0l30jep',
      'template_tau0io5',
      {
        to_name: 'Vanja Ivanovic',   
        to_email: 'ivanovicvanja355@yahoo.com',   
        from_name: contactForm.name, 
        from_email: contactForm.email,
        //birth_date: contactForm.birthDate,
        //birth_time: contactForm.birthTime,
        //birth_place: contactForm.birthPlace,
        productType: contactForm.productType,
        message: contactForm.message
    },
      'mzJxvFV2wfA985nV3'
    )
      .then((response: EmailJSResponseStatus) => {
        console.log('Uspešno poslato!', response.status, response.text);
      })
      .catch((err) => {
        console.error('Greška:', err);
      });
  }
}