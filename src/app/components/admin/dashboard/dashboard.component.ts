import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { I18nPipe } from '../../../pipes/i18n.pipe';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard',
  imports: [I18nPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  totalUsers = 0;
  totalRooms = 0;
  totalReservations = 0;
  totalServices = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.getStatistics();
  }

  getStatistics() {
    this.dashboardService.getNumberOfUsers().subscribe((users) => {
      this.totalUsers = users.length;
    });

    this.dashboardService.getNumberOfRooms().subscribe((rooms) => {
      this.totalRooms = rooms.length;
    });

    this.dashboardService
      .getNumberOfReservations()
      .subscribe((reservations) => {
        this.totalReservations = reservations.length;
        this.getReservationsCharts(reservations);
      });

    this.dashboardService.getNumberOfServices().subscribe((services) => {
      this.totalServices = services.length;
      this.getServicesCharts(services);
    });
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

    const daysInMonth = new Date(year, month + 1, 0).getDate();
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

  getServicesCharts(services: any[]) {
    // services provided this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const dailyCounts = new Array(7).fill(0);

    services.forEach((serv) => {
      const d = new Date(serv.date);
      if (d >= startOfWeek && d < endOfWeek) {
        const day = d.getDay(); // 0 = Sunday
        dailyCounts[day]++;
      }
    });

    new Chart('dailyServicesChart', {
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
            beginAtZero: true,
            min: 0,
          },
        },
      },
    });

    // reservations this month

    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekStarts = [1, 8, 15, 22, 29];
    const weeklyCounts = new Array(weekStarts.length).fill(0);

    function getWeekIndex(day: number) {
      for (let i = weekStarts.length - 1; i >= 0; i--) {
        if (day >= weekStarts[i]) return i;
      }
      return 0;
    }

    console.log(`Current Year: ${year}, Month: ${month + 1}`);
    services.forEach((serv) => {
      const d = new Date(serv.date);
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

    new Chart('weeklyServicesChart', {
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
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    services.forEach((serv) => {
      switch (serv.approvalStatus) {
        case 'Pending':
          statusCounts.pending++;
          break;
        case 'inProgress':
          statusCounts.inProgress++;
          break;
        case 'Completed':
          statusCounts.completed++;
          break;
        case 'Cancelled':
          statusCounts.cancelled++;
          break;
      }
    });

    new Chart('servicesStatusChart', {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [
          {
            data: [
              statusCounts.pending,
              statusCounts.inProgress,
              statusCounts.completed,
              statusCounts.cancelled,
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
            text: 'Services Status Distribution',
          },
        },
      },
    });
  }
}
