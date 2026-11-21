import Foundation
import UserNotifications

@MainActor
final class AlarmStore: ObservableObject {
    static let shared = AlarmStore()

    @Published var alarms: [Alarm] = [] {
        didSet {
            save()
            NotificationScheduler.reschedule(alarms)
        }
    }

    /// 현재 울리고 있어서 미션 화면을 보여줘야 하는 알람 ID
    @Published var ringingAlarmID: UUID?

    private let key = "alarms.v1"

    private init() {
        load()
    }

    /// 지금 이 시각에 미션을 수행해야 하는 알람인지 판단
    func isDue(_ alarm: Alarm, now: Date = .now) -> Bool {
        let cal = Calendar.current
        guard alarm.isEnabled,
              !alarm.challenges.isEmpty,
              alarm.weekdays.contains(cal.component(.weekday, from: now)),
              let fire = cal.date(bySettingHour: alarm.hour, minute: alarm.minute, second: 0, of: now)
        else { return false }

        if let last = alarm.lastCompletedDay, cal.isDate(last, inSameDayAs: now) {
            return false
        }
        return now >= fire
    }

    func checkRinging(now: Date = .now) {
        guard ringingAlarmID == nil,
              let alarm = alarms.first(where: { isDue($0, now: now) })
        else { return }
        ringingAlarmID = alarm.id
    }

    func markCompleted(_ id: UUID) {
        guard let index = alarms.firstIndex(where: { $0.id == id }) else { return }
        alarms[index].lastCompletedDay = Calendar.current.startOfDay(for: .now)
        ringingAlarmID = nil
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }

    func reschedule() {
        NotificationScheduler.reschedule(alarms)
    }

    private func save() {
        if let data = try? JSONEncoder().encode(alarms) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: key),
              let decoded = try? JSONDecoder().decode([Alarm].self, from: data)
        else { return }
        alarms = decoded
    }
}
