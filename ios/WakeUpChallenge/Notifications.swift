import Foundation
import UserNotifications

enum NotificationScheduler {
    /// 알람 시각부터 1분 간격으로 몇 번 울릴지. 미션을 끝내기 전까지 계속 울리게 하는 장치
    static let burstCount = 5
    /// 앞으로 며칠치 알림을 미리 등록할지
    static let daysAhead = 7
    /// iOS 대기 로컬 알림 상한은 64개
    static let maxPending = 60

    static func requestAuthorization() async -> Bool {
        let granted = try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge])
        return granted ?? false
    }

    /// 활성 알람 기준으로 대기 알림을 전부 다시 등록
    static func reschedule(_ alarms: [Alarm], now: Date = .now) {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()

        let cal = Calendar.current
        var pending: [(date: Date, request: UNNotificationRequest)] = []

        for alarm in alarms where alarm.isEnabled && !alarm.challenges.isEmpty {
            for dayOffset in 0..<daysAhead {
                guard let day = cal.date(byAdding: .day, value: dayOffset, to: now),
                      alarm.weekdays.contains(cal.component(.weekday, from: day)),
                      let fire = cal.date(bySettingHour: alarm.hour, minute: alarm.minute, second: 0, of: day),
                      fire > now
                else { continue }

                // 해당 날짜에 이미 미션을 끝냈다면 예약하지 않음
                if let last = alarm.lastCompletedDay, cal.isDate(last, inSameDayAs: fire) { continue }

                for k in 0..<burstCount {
                    let date = fire.addingTimeInterval(TimeInterval(k * 60))

                    let content = UNMutableNotificationContent()
                    content.title = alarm.label
                    content.body = "미션을 완료해야 알람이 꺼집니다. 일어나세요!"
                    content.sound = .default
                    content.interruptionLevel = .timeSensitive
                    content.userInfo = ["alarmID": alarm.id.uuidString]

                    let comps = cal.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
                    let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
                    let id = "\(alarm.id.uuidString)-\(Int(date.timeIntervalSince1970))"
                    let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
                    pending.append((date, request))
                }
            }
        }

        for item in pending.sorted(by: { $0.date < $1.date }).prefix(maxPending) {
            center.add(item.request)
        }
    }
}

/// 알림이 도착하거나 탭되었을 때 울림 상태를 확인해 미션 화면을 띄운다
final class AlarmNotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = AlarmNotificationDelegate()

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        await MainActor.run { AlarmStore.shared.checkRinging() }
        return [.banner, .sound, .list]
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse) async {
        await MainActor.run { AlarmStore.shared.checkRinging() }
    }
}
