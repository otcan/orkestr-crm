import { bootstrapApplication } from "@angular/platform-browser";
import { Component } from "@angular/core";
import { provideRouter, Routes } from "@angular/router";
import { AppComponent } from "./app/app.component";

@Component({
  standalone: true,
  template: ""
})
class RouteSinkComponent {}

const routes: Routes = [
  { path: "start", component: RouteSinkComponent },
  { path: "dashboard", component: RouteSinkComponent },
  { path: "workspace", component: RouteSinkComponent },
  { path: "views/:viewKey", component: RouteSinkComponent },
  { path: "records", component: RouteSinkComponent },
  { path: "records/:objectType", component: RouteSinkComponent },
  { path: "records/:objectType/:recordId", component: RouteSinkComponent },
  { path: "queue", component: RouteSinkComponent },
  { path: "timeline", component: RouteSinkComponent },
  { path: "settings", component: RouteSinkComponent },
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "**", redirectTo: "dashboard" }
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
}).catch((error: unknown) => {
  console.error(error);
});
