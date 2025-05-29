import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/Service.model';
import { ServiceRequest } from '../models/ServiceRequest.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor() {}
  api = inject(HttpClient);
  servicesUrl = 'http://localhost:3000/services';
  servicesRequestsUrl = 'http://localhost:3000/serviceRequests';

  getAllServices(): Observable<Service[]> {
    return this.api.get<Service[]>(this.servicesUrl);
  }

  getServiceById(id: string): Observable<Service> {
    return this.api.get<Service>(`${this.servicesUrl}/${id}`);
  }

  getServicesByEmployeeId(employeeId: string): Observable<Service[]> {
    return this.api.get<Service[]>(
      `${this.servicesUrl}/?employeeId=${employeeId}`
    );
  }
  CreateService(service: Omit<Service, 'id'>): Observable<Service> {
    return this.api.post<Service>(this.servicesUrl, service);
  }

  UpdateService(service: Service): Observable<Service> {
    return this.api.put<Service>(`${this.servicesUrl}/${service.id}`, service);
  }

  DeleteService(id: string): Observable<void> {
    return this.api.delete<void>(`${this.servicesUrl}/${id}`);
  }

  getServicesRequestsByEmployeeId(
    employeeId: string
  ): Observable<ServiceRequest[]> {
    return this.api.get<ServiceRequest[]>(
      `${this.servicesRequestsUrl}/?employeeId=${employeeId}`
    );
  }

  ApproveServicesRequest(
    id: string,
    request: ServiceRequest
  ): Observable<ServiceRequest> {
    return this.api.put<ServiceRequest>(
      `${this.servicesRequestsUrl}/${id}`,
      request
    );
  }

  RejectServicesRequest(
    id: string,
    request: ServiceRequest
  ): Observable<ServiceRequest> {
    return this.api.put<ServiceRequest>(
      `${this.servicesRequestsUrl}/${id}`,
      request
    );
  }
}
