import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface Workout {
  type: string;
  minutes: number;
}

interface TableElement {
  name: string;
  workouts: Workout[];
  count: number;
  minutes: number;
}

const userData = [
  {
    id: 1,
    name: 'John Doe',
    workouts: [
      { type: 'Running', minutes: 30 },
      { type: 'Cycling', minutes: 45 }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    workouts: [
      { type: 'Swimming', minutes: 60 },
      { type: 'Running', minutes: 20 }
    ]
  },
  {
    id: 3,
    name: 'Mike Johnson',
    workouts: [
      { type: 'Yoga', minutes: 50 },
      { type: 'Cycling', minutes: 40 }
    ]
  },
];

let tableData: TableElement[] = userData.map(user => {
  const count = user.workouts.length;
  const minutes = user.workouts.reduce((total, workout) => total + workout.minutes, 0);

  return {
    name: user.name,
    workouts: user.workouts,
    count: count,
    minutes: minutes
  };
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'fyle';
  displayedColumns: string[] = ['name', 'workouts', 'count', 'minutes'];
  dataSource = new MatTableDataSource<TableElement>(tableData);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  username: string = '';
  workoutType: string = '';
  workoutMinutes: number = 0;
  searchValue: string = '';
  selectedCategory: string = 'all';

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.username || !this.workoutType || this.workoutMinutes <= 0) {
      alert("Please fill in all fields with valid values. Workout time must be greater than 0.");
      return;
    }
    let user = this.dataSource.data.find(user => user.name === this.username);

    if (user) {
      // Update existing user
      const workout = user.workouts.find(w => w.type === this.workoutType);
      if (workout) {
        // Workout type exists, update minutes
        user.minutes = user.minutes - workout.minutes + this.workoutMinutes;
        workout.minutes = this.workoutMinutes;
      } else {
        // Workout type does not exist, add new workout
        user.workouts.push({ type: this.workoutType, minutes: this.workoutMinutes });
        user.count++;
        user.minutes += this.workoutMinutes;
      }
    } else {
      // Add new user
      const newUser: TableElement = {
        name: this.username,
        workouts: [{ type: this.workoutType, minutes: this.workoutMinutes }],
        count: 1,
        minutes: this.workoutMinutes
      };
      tableData = [...tableData, newUser];
      this.dataSource.data = [...this.dataSource.data, newUser];
    }

    // Reset form
    this.username = '';
    this.workoutType = '';
    this.workoutMinutes = 0;

    this.applyFilter(); // Apply filter after updating data
  }

  getWorkoutTypes(element: TableElement): string {
    return element.workouts.map(w => w.type).join(', ');
  }

  applyFilter() {
    const filteredData = tableData.filter(user => {
      const matchesSearch = this.searchValue ? user.name.toLowerCase().includes(this.searchValue.toLowerCase()) : true;
      const matchesCategory = this.selectedCategory !== 'all' ? user.workouts.some(w => w.type === this.selectedCategory) : true;
      return matchesSearch && matchesCategory;
    });

    this.dataSource.data = filteredData;
  }
}