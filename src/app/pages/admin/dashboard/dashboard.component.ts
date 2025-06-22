import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [I18nPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  totalEmployees = 0;
  totalCustomers = 0;
  totalRooms = 0;
  totalReservations = 0;
  totalServices = 0;
  totalServicesRequests = 0;
  avgServicesPerEmployee = 0;
  avgReservationsPerDay = 0;
  avgRequestsPerDay = 0;

  employeeOfTheMonth = '';
  getTopSellingService = '';
  mostBookedRoomType = '';

  subscriptions: Subscription[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.getStatistics();
  }

  getStatistics() {
    // System Overview
    const getTotalEmployeesSub = this.dashboardService
      .getTotalEmployees()
      .subscribe((emps) => {
        this.totalEmployees = emps;
      });
    this.subscriptions.push(getTotalEmployeesSub);

    const getTotalCustomersSub = this.dashboardService
      .getTotalCustomers()
      .subscribe((custs) => {
        this.totalCustomers = custs;
      });
    this.subscriptions.push(getTotalCustomersSub);

    const getNumberOfRoomsSub = this.dashboardService
      .getNumberOfRooms()
      .subscribe((rooms) => {
        this.totalRooms = rooms.length;
      });
    this.subscriptions.push(getNumberOfRoomsSub);

    const getNumberOfReservationsSub = this.dashboardService
      .getNumberOfReservations()
      .subscribe((reservations) => {
        this.totalReservations = reservations.length;
        this.getReservationsCharts(reservations); // Reservations Charts
      });
    this.subscriptions.push(getNumberOfReservationsSub);

    const getNumberOfServicesSub = this.dashboardService
      .getNumberOfServices()
      .subscribe((services) => {
        this.totalServices = services.length;
        this.avgServicesPerEmployee = parseFloat(
          (this.totalServices / this.totalEmployees).toFixed(2)
        ); // Performance Metrics - Avg Services Per Employee
      });
    this.subscriptions.push(getNumberOfServicesSub);

    const getNumberOfServicesRequestsSub = this.dashboardService
      .getNumberOfServicesRequests()
      .subscribe((request) => {
        this.totalServicesRequests = request.length;
        this.getServicesRequestsCharts(request); // Services Requests Charts
      });
    this.subscriptions.push(getNumberOfServicesRequestsSub);

    // Performance Metrics

    const getAvgReservationsPerDaySub = this.dashboardService
      .getAvgReservationsPerDay()
      .subscribe((result) => {
        this.avgReservationsPerDay = parseFloat(result.toFixed(2));
      });
    this.subscriptions.push(getAvgReservationsPerDaySub);

    const getAvgServicesPerDaySub = this.dashboardService
      .getAvgServicesPerDay()
      .subscribe((result) => {
        this.avgRequestsPerDay = parseFloat(result.toFixed(2));
      });
    this.subscriptions.push(getAvgServicesPerDaySub);

    // Highlights
    const getEmployeeOfTheMonthSub = this.dashboardService
      .getEmployeeOfTheMonth()
      .subscribe((result) => {
        this.employeeOfTheMonth = result ?? 'In Progress';
      });
    this.subscriptions.push(getEmployeeOfTheMonthSub);

    const getTopSellingServiceSub = this.dashboardService
      .getTopSellingService()
      .subscribe((result) => {
        this.getTopSellingService = result ?? 'In Progress';
      });
    this.subscriptions.push(getTopSellingServiceSub);

    const getMostBookedRoomTypeSub = this.dashboardService
      .getMostBookedRoomType()
      .subscribe((result) => {
        this.mostBookedRoomType = result ?? 'In Progress';
      });
    this.subscriptions.push(getMostBookedRoomTypeSub);
  }

  getReservationsCharts(reservations: any[]) {
    // reservations this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const dailyCounts = new Array(7).fill(0);

    reservations.forEach((res) => {
      const d = new Date(res.date);
      if (d >= startOfWeek && d < endOfWeek) {
        const day = d.getDay(); // 0 = Sunday
        dailyCounts[day]++;
      }
    });

    new Chart('dailyBookingChart', {
      type: 'line',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'Reservations This Week',
            data: dailyCounts,
            borderWidth: 2,
            borderColor: 'green',
            tension: 0.3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true, // Ensures Y-axis starts at 0
            min: 0, // Explicitly prevents going below 0
          },
        },
      },
    });

    // reservations this month

    const year = now.getFullYear();
    const month = now.getMonth();

    const weekStarts = [1, 8, 15, 22, 29];
    const weeklyCounts = new Array(weekStarts.length).fill(0);

    function getWeekIndex(day: number) {
      for (let i = weekStarts.length - 1; i >= 0; i--) {
        if (day >= weekStarts[i]) return i;
      }
      return 0;
    }

    console.log(`Current Year: ${year}, Month: ${month + 1}`);
    reservations.forEach((res) => {
      const d = new Date(res.date);
      const resYear = d.getFullYear();
      const resMonth = d.getMonth(); // 0 = Jan
      const resDay = d.getDate();

      console.log(`Parsed: ${resYear}-${resMonth + 1}-${resDay}`);

      if (resYear === year && resMonth === month) {
        const weekIndex = getWeekIndex(resDay);
        weeklyCounts[weekIndex]++;
      }
    });

    const labels = weekStarts.map((day) => `${day}/${month + 1}`);

    console.log('Weekly counts:', weeklyCounts);

    new Chart('weeklyBookingChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Reservations This Month',
            data: weeklyCounts,
            borderWidth: 2,
            borderColor: 'green',
            tension: 0.3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
          },
        },
      },
    });

    // Count reservations by status
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    reservations.forEach((res) => {
      switch (res.approvalStatus) {
        case 'Pending':
          statusCounts.pending++;
          break;
        case 'Approved':
          statusCounts.approved++;
          break;
        case 'Rejected':
          statusCounts.rejected++;
          break;
      }
    });
    // OR
    // reservations.forEach((res) => {
    //   if (['Pending', 'Approved', 'Rejected'].includes(res.status)) {
    //     statusCounts[(res.status as 'Pending' | 'Approved', 'Rejected')]++;
    //   }
    // });

    new Chart('reservationStatusChart', {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
          {
            data: [
              statusCounts.pending,
              statusCounts.approved,
              statusCounts.rejected,
            ],
            backgroundColor: ['orange', 'green', 'red'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Reservation Status Distribution',
          },
        },
      },
    });
  }

  getServicesRequestsCharts(requests: any[]) {
    // requests provided this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const dailyCounts = new Array(7).fill(0);

    requests.forEach((serv) => {
      const d = new Date(serv.date);
      if (d >= startOfWeek && d < endOfWeek) {
        const day = d.getDay(); // 0 = Sunday
        dailyCounts[day]++;
      }
    });

    new Chart('dailyRequestsChart', {
      type: 'line',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'Requests This Week',
            data: dailyCounts,
            borderWidth: 2,
            borderColor: 'green',
            tension: 0.3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
          },
        },
      },
    });

    // requests this month
    const year = now.getFullYear();
    const month = now.getMonth();

    const weekStarts = [1, 8, 15, 22, 29];
    const weeklyCounts = new Array(weekStarts.length).fill(0);

    function getWeekIndex(day: number) {
      for (let i = weekStarts.length - 1; i >= 0; i--) {
        if (day >= weekStarts[i]) return i;
      }
      return 0;
    }

    console.log(`Current Year: ${year}, Month: ${month + 1}`);
    requests.forEach((req) => {
      const d = new Date(req.date);
      const resYear = d.getFullYear();
      const resMonth = d.getMonth(); // 0 = Jan
      const resDay = d.getDate();

      console.log(`Parsed: ${resYear}-${resMonth + 1}-${resDay}`);

      if (resYear === year && resMonth === month) {
        const weekIndex = getWeekIndex(resDay);
        weeklyCounts[weekIndex]++;
      }
    });

    const labels = weekStarts.map((day) => `${day}/${month + 1}`);

    console.log('Weekly counts:', weeklyCounts);

    new Chart('weeklyRequestsChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Requests This Month',
            data: weeklyCounts,
            borderWidth: 2,
            borderColor: 'green',
            tension: 0.3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
          },
        },
      },
    });

    // Count requests by status
    const statusCounts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      canceled: 0,
    };

    requests.forEach((res) => {
      switch (res.requestStatus) {
        case 'Pending':
          statusCounts.pending++;
          break;
        case 'In Progress':
          statusCounts.inProgress++;
          break;
        case 'Completed':
          statusCounts.completed++;
          break;
        case 'Canceled':
          statusCounts.canceled++;
          break;
      }
    });

    new Chart('requestsStatusChart', {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Completed', 'Canceled'],
        datasets: [
          {
            data: [
              statusCounts.pending,
              statusCounts.inProgress,
              statusCounts.completed,
              statusCounts.canceled,
            ],
            backgroundColor: ['orange', 'blue', 'green', 'red'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Requests Status Distribution',
          },
        },
      },
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
