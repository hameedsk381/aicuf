"use client"

import { useFormContext } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

export default function StepOne() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-light text-primary mb-4">Application Type</h3>
        <FormField
          control={control}
          name="applicationType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="membership" id="membership" />
                    <Label htmlFor="membership">Membership</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leadership" id="leadership" />
                    <Label htmlFor="leadership" className="text-sm sm:text-base">Leadership (Only II Year Students)</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-light text-primary mb-4">Personal Details</h3>
        <div className="space-y-6">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your age" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="registrationNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your registration number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your course" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="instagramId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Instagram ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="mobileNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your mobile number" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="whatsappNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp No.</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your WhatsApp number" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="emailId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Min. 8 characters" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Re-enter password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="religion"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Religion</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="catholic" id="catholic" />
                      <Label htmlFor="catholic">Catholic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="christian" id="christian" />
                      <Label htmlFor="christian">Christian</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other-religion" />
                      <Label htmlFor="other-religion">Other</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (If you are a hosteller, write your hostel address)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your address" className="resize-none min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
