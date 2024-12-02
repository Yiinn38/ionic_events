import { Component } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss', 'home.page-overlay.scss'],
})
export class HomePage {
  showSyncOverlay: boolean = false;
  showAddOverlay: boolean = false;
  showEditOverlay: boolean = false;
  showSyncMessage: boolean = false;
  wifi: boolean = false;
  movil: boolean = false;
  syncMessage: string = 'SINCRONIZANDO ESPERE UN MOMENTO...';

  currentEditIndex: number = -1;
  editEventData: any = {};

  originalEventos = [
    {
      title: 'Evento 1',
      description: 'Descripción del evento 1',
      date: '2024-03-12',
      place: 'León, Gto',
      img: 'https://placehold.co/600x400'
    },
  ];

  eventos: any[] = [];
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private network: Network) {
    this.eventos = [...this.originalEventos];
  }

  searchEvents() {
    this.eventos = this.originalEventos.filter(evento =>
      evento.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortEvents();
  }

  sortEvents() {
    this.eventos.sort((a, b) => {
      return this.sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });
  }

  changeSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortEvents();
  }

  agregarEvento(titulo: string, descripcion: string, fecha: string, localizacion: string, imagenInput: HTMLInputElement) {
    const imagen = imagenInput.files ? imagenInput.files[0] : null;

    if (!imagen) {
      alert('Selecciona una imagen');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const nuevoEvento = {
        title: titulo,
        description: descripcion,
        date: fecha,
        place: localizacion,
        img: e.target.result
      };
      this.originalEventos.push(nuevoEvento);
      this.searchEvents();
      this.clearEventForm();
      this.showAddOverlay = false;
    };

    reader.readAsDataURL(imagen);
  }

  clearEventForm() {
    this.eventos = [...this.originalEventos];
  }

  editarEvento(index: number) {
    this.currentEditIndex = index;
    this.editEventData = { ...this.eventos[index] };
    this.showEditOverlay = true;
  }

  guardarEdicion(titulo: string, descripcion: string, fecha: string, localizacion: string, imagenInput: HTMLInputElement) {
    if (this.currentEditIndex >= 0 && this.currentEditIndex < this.eventos.length) {
      const imagen = imagenInput.files ? imagenInput.files[0] : null;

      const originalEvent = this.originalEventos.find(
        evento => evento.title === this.eventos[this.currentEditIndex].title
      );

      const updateEvent = (imgSrc: string) => {
        if (originalEvent) {
          Object.assign(originalEvent, {
            title: titulo,
            description: descripcion,
            date: fecha,
            place: localizacion,
            img: imgSrc
          });
        }
        this.searchEvents();
        this.showEditOverlay = false;
        this.currentEditIndex = -1;
      };

      if (imagen) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          updateEvent(e.target.result);
        };
        reader.readAsDataURL(imagen);
      } else {
        updateEvent(originalEvent?.img || '');
      }
    }
  }

  closeEditOverlay(event: Event) {
    this.showEditOverlay = false;
    this.currentEditIndex = -1;
    event.stopPropagation();
  }

  borrarEvento(index: number) {
    const evento = this.eventos[index];
    const originalIndex = this.originalEventos.findIndex(e => e.title === evento.title);

    if (originalIndex !== -1) {
      this.originalEventos.splice(originalIndex, 1);
      this.searchEvents();
    }
  }

  shareWsp(evento: any) {
    const msg = `Título: ${evento.title} \nDescripción: ${evento.description} \nFecha: ${evento.date} \nLugar: ${evento.place}`;
    const linkWsp =  `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(linkWsp, '_blank');
  }

  openSyncOverlay() {
    this.showSyncOverlay = true;
  }

  openAddOverlay() {
    this.showAddOverlay = true;
  }

  openEditOverlay() {
    this.showEditOverlay = true;
  }

  closeSyncOverlay(event: Event) {
    if (!this.showSyncMessage) {
      this.showSyncOverlay = false;
      this.wifi = false;
      this.movil = false;
    }
    event.stopPropagation();
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  closeAddOverlay(event: Event) {
    this.showAddOverlay = false;
    event.stopPropagation();
  }

  preventCloseAdd(event: Event) {
    event.stopPropagation();
  }

  onCheckboxChange(checkbox: string) {
    if (checkbox === 'wifi') {
      if (this.wifi) {
        this.movil = false;
      }
    } else if (checkbox === 'movil') {
      if (this.movil) {
        this.wifi = false;
      }
    }
  }

  sincronizar() {
    this.showSyncMessage = true;

    const isConnected =
      this.network.type !== this.network.Connection.NONE &&
      this.network.type !== this.network.Connection.UNKNOWN;

    if (isConnected && (this.wifi || this.movil)) {
      this.syncMessage = 'SINCRONIZANDO ESPERE UN MOMENTO...';

      setTimeout(() => {
        this.syncMessage = 'SINCRONIZACION HECHA';

        setTimeout(() => {
          this.showSyncMessage = false;
          this.showSyncOverlay = false;
          this.wifi = false;
          this.movil = false;
        }, 1500);
      }, 5000);
    } else {
      // No hay conexión a internet
      this.syncMessage = 'SINCRONIZACION FALLIDA, NO HAY CONEXION A INTERNET';

      setTimeout(() => {
        this.showSyncMessage = false;
      }, 3000);
    }
    this.clearEventForm();
  }
}
