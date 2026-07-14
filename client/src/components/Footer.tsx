export default function Footer() {
    return (
        <footer>
            <p className="text-center text-[13px] py-4 border-t border-gray-300/10">&copy; <span>{new Date().getFullYear()}</span> Movie Lantern. All rights reserved.</p>
        </footer>
    )
}