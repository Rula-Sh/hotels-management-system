import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000/services';

  getAllServices(): Observable<Service[]> {
    return this.api.get<Service[]>(this.url);
  }

  getServiceById(id: string): Observable<Service> {
    return this.api.get<Service>(`${this.url}/${id}`);
  }

  CreateService(service: Omit<Service, 'id'>): Observable<Service> {
    return this.api.post<Service>(this.url, service);
  }

  UpdateService(service: Service): Observable<Service> {
    return this.api.put<Service>(`${this.url}/${service.id}`, service);
  }
}
