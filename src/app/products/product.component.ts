import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs, { EmailJSResponseStatus, send } from 'emailjs-com';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  contactForm?: ContactForm;
}

interface ContactForm {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  productType: string;
  productCount: string;
  message: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductsComponent {
  cartItems: Product[] = [];
  showHoroscopeModal: boolean = false;
  isHoroscopeProduct: boolean = false; //da li je u pitanju sveca kao proizvod ili horposkop

  products: Product[] = [
    {
      id: 1,
      name: 'Magične Sveće sa Kristalima',
      price: 3600,
      description: 'Ručno pravljene sveće obogaćene kristalima'
    },
    {
      id: 2,
      name: 'Personalizovani Mesečni Horoskop',
      price: 8000,
      description: 'Detaljni mesečni horoskop napisan posebno za vas'
    }
  ];

  contactForm: ContactForm = {
    name: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    productType: '',
    productCount: '',
    message: ''
  };

  addToCart(product: Product) {
    // Kreiraj kopiju proizvoda i upiši trenutni contactForm
    const productWithForm: Product = {
      ...product,
      contactForm: { ...this.contactForm } // kopiramo formu da ne mutiramo original
    };

    this.cartItems.push(productWithForm);

    //alert(`✨ ${product.name} je dodato u korpu! ✨`);
  }


  removeFromCart(product: Product) {
    const index = this.cartItems.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price, 0);
  }

  isFormValid(): boolean {
    return !!(this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.birthDate &&
      this.contactForm.birthPlace);
  }

  submitCartItems() {
    if (this.cartItems.length > 0) {
      this.cartItems.forEach(product => {
        if (product.contactForm) {
          this.sendEmail(product.contactForm);
        }
      });

      this.cartItems = [];
    }
  }

  sendEmail(contactForm: ContactForm) {
    emailjs.send(
      'service_0l30jep',
      'template_crcmj5l',
      {
        to_name: 'Vanja Ivanovic',
        to_email: 'ivanovicvanja355@yahoo.com',
        from_name: contactForm.name,
        from_email: contactForm.email,
        birth_date: contactForm.birthDate,
        birth_time: contactForm.birthTime,
        birth_place: contactForm.birthPlace,
        productType: contactForm.productType,
        productCount: 1, //saljemo 1 po 1 zahtev
        message: contactForm.message
      },
      'mzJxvFV2wfA985nV3'
    )
      .then((response: EmailJSResponseStatus) => {

        this.showSuccessMessage();

        this.clearForm();

      })
      .catch((err) => {
        this.showErrorMessage();
      });
  }

  openProductModal() {
    this.showHoroscopeModal = true;
    this.isHoroscopeProduct = false;
    this.clearForm();
  }

  // NOVE METODE za modal
  openHoroscopeModal() {
    this.showHoroscopeModal = true;
    this.isHoroscopeProduct = true;
    this.clearForm();
  }

  closeHoroscopeModal() {
    this.showHoroscopeModal = false;
  }

  submitContactForm() {
    if (this.isFormValid()) {
      // Dodajte horoskop u korpu

      if (this.isHoroscopeProduct) {
        this.contactForm.productType = 'Pesonalizovani mesecni horoskop';
         this.sendEmail(this.contactForm); // Personalizovani horoskop    
      }
      else {
        this.contactForm.productType = 'Personalizovane svece';
        this.addToCart(this.products[0]); // Personalizovane svece    
      }

      // Zatvori modal
      this.closeHoroscopeModal();
    }
  }

  private showSuccessMessage() {

    const toast = document.createElement('div');
    toast.innerHTML = '✨ Vaš zahtev je uspešno poslat! ✨';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #ffd700, #ffb347);
      color: #1a1a2e;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  private showErrorMessage() {

    const toast = document.createElement('div');
    toast.innerHTML = '✨ Dogodila se greska prilikom porucivanja! Molim vas kontakritatje me na broj: +381 441 22 16✨';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #ffd700, #ffb347);
      color: #1a1a2e;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  private clearForm() {
    this.contactForm = {
      name: '',
      email: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      productType: '',
      productCount: this.cartItems.length.toString(),
      message: ''
    };
  }
}