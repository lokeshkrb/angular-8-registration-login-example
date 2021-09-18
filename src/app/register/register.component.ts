import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, UserService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    fileContent: string = '';
    count: number;
    fileName: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            emailAddress: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            file: ['',],
            fileName: ['',],
            fileContent: ['',],
            wordCount: ['',]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
    public onUpload(fileList: FileList): void {
            console.log(fileList[0]);
            let file = fileList[0];
            this.registerForm.value.fileName = fileList[0].name;
            let fileReader: FileReader = new FileReader();
            let self = this;
            fileReader.onloadend = function(x) {
              self.registerForm.value.fileContent = fileReader.result as string;
              self.fileContent =  self.registerForm.value.fileContent.split('\n').join(' ');
              self.registerForm.value.wordCount = self.fileContent.split(' ').length;
            }
            fileReader.readAsText(file);
          }
}
