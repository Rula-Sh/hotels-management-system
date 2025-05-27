import { Component ,OnInit,inject} from '@angular/core';
import { Service } from '../../../models/Service.model';
import { ServiceService } from '../../../services/service.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-available-services',
  imports: [CommonModule],
  templateUrl: './available-services.component.html',
  styleUrl: './available-services.component.scss'
})
export class AvailableServicesComponent implements OnInit {
  services: Service[] = [];
  private serviceService = inject(ServiceService);

  ngOnInit(): void {
    this.loadAvailableServices();
  }

  loadAvailableServices(): void {
    this.serviceService.getAllServices().subscribe({
      next: (services: Service[]) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Error loading available services:', error);
      }
    });
  }

}
