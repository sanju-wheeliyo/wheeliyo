import mongoose from 'mongoose'
import imageSchema from './image'

const numberWithType = (default_type) => ({
    value: Number,
    value_type: {
        type: String,
        default: default_type,
    },
})
const variantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        images: [imageSchema],
        model_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        price: numberWithType("₹"),
        // key_data: {
        //     key_price: numberWithType("₹"),
        //     key_mileage: numberWithType("KMPL"),
        //     key_engine: numberWithType("CC"),
        //     key_transmission: String,
        //     key_fuel_type: String,
        //     key_seating_capacity: String
        // },
        // engine_and_transmission: {
        //     engine: String,
        //     engine_type: String,
        //     fuel_type: String,
        //     max_power: numberWithType("BHP"),
        //     max_power_rpm: numberWithType("RPM"),
        //     max_torque: numberWithType("NM"),
        //     max_torque_rpm: numberWithType("RPM"),
        //     mileage: numberWithType("KMPL"),
        //     driving_range: numberWithType("KM"),
        //     drivetrain: String,
        //     transmission: String,
        //     emission_standard: String,
        //     charger: String,
        //     battery: String,
        //     electric_motor: String,
        //     others: String
        // },
        // dimensions_and_weight: {
        //     length: numberWithType("MM"),
        //     width: numberWithType("MM"),
        //     height: numberWithType("MM"),
        //     wheelbase: numberWithType("MM"),
        //     ground_clearance: numberWithType("MM"),
        //     kerb_weight: numberWithType("KG")
        // },
        // capacity: {
        //     doors: numberWithType("Door"),
        //     seating_capacity: numberWithType("Person"),
        //     seating_rows: numberWithType("Row"),
        //     boots_space: numberWithType("Liter"),
        //     fuel_tank_capacity: numberWithType("Liter")
        // },
        // suspensions_breaks_steering_tyres: {
        //     front_suspension: String,
        //     rear_suspension: String,
        //     front_break_type: String,
        //     rear_break_type: String,
        //     min_turing_radius: String,
        //     steering_type: String,
        //     wheels: String,
        //     spare_wheel: String,
        //     front_tyres: String,
        //     rear_tyres: String
        // },
        // safety: {
        //     airbags: String,
        //     middle_rear_three_point_seatbelt: String,
        //     middle_rear_head_rest: String,
        //     tyre_pressure_monitoring_system: String,
        //     child_seat_anchor_points: String,
        //     seat_belt_warning: String
        // },
        // breaking_and_traction: {
        //     anti_lock_breaking_system: String,
        //     electronic_break_force_distribution: String,
        //     break_assist: String,
        //     electronic_stability_program: String,
        //     four_wheel_drive: String,
        //     hill_hold_control: String,
        //     traction_control_system: String,
        //     ride_height_adjustment: String,
        //     hill_descent_control: String,
        //     limited_slip_differential: String,
        //     differential_lock: String
        // },
        // locks_and_security: {
        //     engine_immobilizer: String,
        //     central_locking: String,
        //     speed_sensing_door_lock: String,
        //     child_safety_lock: String
        // },
        // comfort_and_convenience: {
        //     air_conditioner: String,
        //     front_ac: String,
        //     rear_ac: String,
        //     headlight_and_ignition_on_reminder: String,
        //     keyless_start: String,
        //     steering_adjustment: String,
        //     power_outlet_12: mongoose.Schema.Types.Mixed,
        //     cruise_control: String,
        //     parking_sensor: String,
        //     parking_assist: String,
        //     anti_glare_mirror: String,
        //     vanity_mirror_on_sun_visors: String,
        //     heater: String,
        //     cabin_boot_access: String
        // },
        // telematics: {
        //     car_light_flash_and_honking_via_app: String,
        //     geo_fence: String,
        //     remote_sunroof: String,
        //     ota_updates: String,
        //     vehicle_status_via_app: String,
        //     car_lock_via_app: String,
        //     emergency_call: String,
        //     find_my_car: String
        // },
        // seats_and_upholstery: {
        //     driver_seat_adjustment: String,
        //     passenger_seat_adjustment: String,
        //     rear_row_adjustment: String,
        //     third_row_adjustment: String,
        //     seat_upholstery: String,
        //     leather_wrapped_steering_wheel: String,
        //     leather_wrapped_gear_knob: String,
        //     driver_armrest: String,
        //     rear_passenger_seats_type: String,
        //     third_row_seats_type: String,
        //     ventilated_seats: String,
        //     ventilated_seat_type: String,
        //     interiors: String,
        //     interior_colors: String,
        //     rear_armrest: String,
        //     folding_rear_seat: String,
        //     split_rear_seat: String,
        //     split_third_row_seat: String,
        //     front_seat_pockets: String,
        //     head_rests: String
        // },
        // storage: {
        //     driver_armrest_storage: String,
        //     cooled_glove_box: String,
        //     sunglass_holder: String,
        //     third_row_cup_holder: String,
        //     one_touch_down: String,
        //     one_touch_up: String
        // },
        // doors_windows_mirrors_wipers: {
        //     power_windows: String,
        //     adjustable_ORVM: String,
        //     turn_indicators: String,
        //     rear_defogger: String,
        //     rear_wiper: String,
        //     exterior_door_handles: String,
        //     rain_sensing_wipers: String,
        //     interior_door_handles: String,
        //     door_pockets: String,
        //     side_window_blinds: String,
        //     boot_lid_opener: String,
        //     rear_winds_shield_blind: String,
        //     outside_rear_view_mirror: String
        // },
        // exterior: {
        //     sunroof: String,
        //     root_rails: String,
        //     root_mounted_antenna: String,
        //     body_coloured_bumpers: String,
        //     chrome_finish_exhaust_pipe: String,
        //     body_kit: String,
        //     rub_strips: String
        // },
        // lighting: {
        //     fog_lights: String,
        //     daytime_running_lights: String,
        //     headlights: String,
        //     automatic_head_lamps: String,
        //     follow_me_home_headlamps: String,
        //     tall_lights: String,
        //     cabin_lamps: String,
        //     headlight_height_adjuster: String,
        //     glove_box_lamp: String,
        //     lights_on_vanity_mirror: String,
        //     rear_reading_lamp: String,
        //     cornering_headlights: String
        // },
        // instrumentation: {
        //     instrument_cluster: String,
        //     trip_meter: String,
        //     average_fuel_consumption: String,
        //     average_speed: String,
        //     distance_empty: String,
        //     clock: String,
        //     low_fuel_warning: String,
        //     door_ajar_warning: String,
        //     adjustable_cluster_bright: String,
        //     gear_indicator: String,
        //     shift_indicator: String,
        //     heads_up_display: String,
        //     tacho_meter: String,
        //     instantaneous_consumption: String
        // },
        // entertainment_communication: {
        //     smart_connectivity: String,
        //     integrated_music_system: String,
        //     head_unit_size: String,
        //     display: String,
        //     display_screen_for_rear_passengers: String,
        //     gps_navigation: String,
        //     speakers: String,
        //     usb_compatibility: String,
        //     aux_compatibility: String,
        //     bluetooth_compatibility: String,
        //     mp3_play_back: String,
        //     cd_player: String,
        //     dvd_playback: String,
        //     radio: String,
        //     ipod_compatibility: String,
        //     internal_hard_drive: String,
        //     steering_mounted_controls: String,
        //     voice_command: String
        // },
        description: String
    },
    {
        timestamps: true,
    }
)

export default mongoose.models?.variants || mongoose.model('variants', variantSchema)
